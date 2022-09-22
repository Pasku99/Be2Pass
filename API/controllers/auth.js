const { response } = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { generateJWT } = require('../helpers/jwt');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const forge = require('node-forge');
const CryptoJS = require("crypto-js");

const token = async(req, res = response) => {

    const token = req.headers['x-token'];
    
    try {
        const { id } = jwt.verify(token, process.env.JWTSECRET);
        const userDB = await User.findById(id);
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido',
            });
        }

        const newToken = await generateJWT(id, userDB.rol);
        res.json({
            ok: true,
            msg: 'Token',
            user: {
                id: userDB.id,
                TIN: userDB.TIN,
                email: userDB.email,
                name: userDB.name,
                firstSurname: userDB.firstSurname,
                secondSurname: userDB.secondSurname,
                companyId: userDB.companyId,
                creation_date: userDB.creation_date,
                rol: userDB.rol,
                privateKey: userDB.privateKey,
                publicKey: userDB.publicKey,
                token: newToken
            }
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
        });
    }
}

const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const userDB = await User.findOne({ email });
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
            });
        }

        const validPassword = await argon2.verify(userDB.password, password);
        if (!validPassword) {
            return res.status(401).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
            });
        }

        if (!userDB.isVerified) {
            return res.status(401).json({
                ok: false,
                msg: 'Verifique su email para poder iniciar sesión',
            });
        }

        const { _id } = userDB;
        const token = await generateJWT(userDB._id ?? userDB.id, userDB.rol);
        res.json({
            ok: true,
            msg: 'login',
            user: {
                id: _id,
                email: userDB.email,
                creation_date: userDB.creation_date,
                isVerified: userDB.isVerified,
                token: token
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
        });
    }

}

const passwordRecovery = async(req, res = response) => {
    const { recoveryToken, password, confirmPassword } = req.body;
    try {
        const areEqual = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(confirmPassword));
        if(!areEqual) {
            return res.status(400).json({
                ok: false,
                msg: 'Las contraseñas no coinciden',
            });
        }
        const user = await User.findOne({ recoveryToken: recoveryToken });
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al cambiar contraseña',
            });
        }

        const salt = bcrypt.genSaltSync();
        const cpassword = await argon2.hash(password, salt);
        user.password = cpassword;
        user.recoveryToken = '';
        let keypair = forge.pki.rsa.generateKeyPair({ bits: 4096, e: 0x10001 });
        user.publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
        user.privateKey = CryptoJS.AES.encrypt(
                            forge.pki.privateKeyToPem(keypair.privateKey), 
                            password, 
                            { mode: CryptoJS.mode.CTR }
                        ).toString();
        const userSaved = await user.save();
        if(!userSaved) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al cambiar contraseña',
            });
        }
        res.json({
            ok: true,
            msg: 'Contraseña cambiada correctamente',
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error checking password',
        });
    }
}

const sendEmailRecovery = async(req, res = response) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({email: email});
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Email no existente'
            });
        }
        user.recoveryToken = crypto.randomBytes(16).toString('hex');
        const savedUser = await user.save();
        if(!savedUser) {
            return res.status(400).json({
                ok: false,
                msg: 'Error en el envío'
            });
        }
        let transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'be2pass2022@gmail.com', pass: 'lzhkfdorvkgsiocu' } });
        // let mailOptions = { from: 'be2pass2022@gmail.com', to: savedUser.email, subject: 'Clave de inicio de sesión - Be2Pass', text: 'Muy buenas,\n\n' + 'Su contraseña es ' + randomPassword + '\nSi desea cambiarla por favor haga click en el siguiente enlace: \nhttps://' + process.env.HOST + '/password-recovery/' + savedUser.recoveryToken };
        let mailOptions = { from: 'be2pass2022@gmail.com', to: email, subject: 'Recuperación de contraseña - Be2Pass', text: 'Muy buenas,\n\n' + '\nSi desea cambiar su contraseña por favor haga click en el siguiente enlace:\n' + process.env.HOST + '/password-recovery/' + savedUser.recoveryToken };
        transporter.sendMail(mailOptions, function(err) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en el envío'
                });
            }
        });
        
        res.json({
            ok: true,
            msg: 'Un email de recuperación de contraseña ha sido enviado a ' + savedUser.email + '.',
            user: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error checking password',
        });
    }
}

module.exports = { login, token, passwordRecovery, sendEmailRecovery }