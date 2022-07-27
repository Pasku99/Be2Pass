const User = require('../models/users');
const Key = require('../models/keys');
const Company = require('../models/companies'); 
const bcrypt = require('bcrypt');
const argon2 = require('argon2');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const CryptoJS = require("crypto-js");
const forge = require('node-forge');
const { response } = require('express');
const { infoToken } = require('../helpers/info-token');
const { ObjectID } = require('bson');

/*
get / 
<-- desde? el salto para buscar en la lista de usuarios
    id? un identificador concreto, solo busca a este
--> devuleve todos los usuarios
*/

const getUsers = async(req, res) => {
    // Para paginación
    // Recibimos el desde si existe y establecemos el número de registros a devolver por pa´gina
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);
    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }
    // Obtenemos el ID de usuario por si quiere buscar solo un usuario
    const id = req.query.id || '';

    //await sleep(1000);
    try {

        // Solo puede listar usuarios un admin
        const token = req.header('x-token');
        // if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).id === id))) {
        //     return res.status(400).json({
        //         ok: false,
        //         msg: 'No tiene permisos para listar usuarios',
        //     });
        // }

        let usuarios, total;
        // Si ha llegado ID, hacemos el get /id
        if (id) {

            [usuarios, total] = await Promise.all([
                User.findById(id),
                User.countDocuments()
            ]);

        }
        // Si no ha llegado ID, hacemos el get / paginado
        else {
            if (texto) {
                [usuarios, total] = await Promise.all([
                    User.find({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] }).skip(desde).limit(registropp),
                    User.countDocuments({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] })
                ]);
            } else {
                [usuarios, total] = await Promise.all([
                    User.find({}).skip(desde).limit(registropp),
                    User.countDocuments()
                ]);
            }

        }
        res.json({
            ok: true,
            msg: 'getUsers',
            users: usuarios.filter((user) => user.id !== infoToken(token).id),
            page: {
                desde,
                registropp,
                total
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo usuarios'
        });
    }
}

const createUserCompanyManager = async(req, res = response) => {

    const { TIN, name, firstSurname, secondSurname, email, password, confirmPassword, companyTIN, companyName, companyCountry } = req.body;

    try {
        const isExistingCompanyTIN = await Company.findOne({ TIN: TIN });
        if (isExistingCompanyTIN) {
            return res.status(400).json({
                ok: false,
                msg: 'TIN empresa existente'
            });
        }

        const isExistingEmail = await User.findOne({ email: email }); 
        if (isExistingEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email exists'
            });
        }

        const areEqual = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(confirmPassword));
        if(!areEqual) {
            return res.status(400).json({
                ok: false,
                msg: 'Las contraseñas no coinciden',
            });
        }

        const company = new Company(
            {
                TIN: companyTIN,
                name: companyName,
                country: companyCountry
            }
        )

        const savedCompany = await company.save();
        if (!savedCompany) {
            return res.status(500).json({
                ok: false,
                msg: 'Error saving company'
            });
        }

        const salt = bcrypt.genSaltSync();
        const cpassword = await argon2.hash(password, salt);

        const user = new User(
            {
                TIN,
                email,
                name,
                firstSurname,
                secondSurname,
                rol: "COMPANY_MANAGER"
            }
        );
        user.password = cpassword;

        let keypair = forge.pki.rsa.generateKeyPair({ bits: 4096, e: 0x10001 });

        user.publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
        user.privateKey = CryptoJS.AES.encrypt(forge.pki.privateKeyToPem(keypair.privateKey), password, { mode: CryptoJS.mode.CTR }).toString()
        user.companyId = company.id;

        const savedEmployee = await user.save();
        if (!savedEmployee) {
            return res.status(500).json({
                ok: false,
                msg: 'Error saving user'
            });
        }

        res.json({
            ok: true,
            msg: 'Company manager and company created succesfully',
            user: user,
            company: company
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando empresa y administrador de la empresa'
        });
    }
}

const createUser = async(req, res = response) => {
    const token = req.header('x-token');
    const { employees, idAdmin } = req.body;

    try {
        if (!((infoToken(token).rol === 'COMPANY_MANAGER') || (infoToken(token).id === idAdmin))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar usuarios',
            });
        }
        const admin = await User.findById(idAdmin);
        if (!admin) {
            return res.status(400).json({
                ok: false,
                msg: 'Administrador de empresa no encontrado'
            });
        }
        const isExistingEmail = await User.findOne({ email: employees.map((employee) => employee.email) })
        if (isExistingEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email exists'
            });
        }

        let createdEmployees = [];
        for(const employee of employees) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = bcrypt.genSaltSync();
            const cpassword = await argon2.hash(randomPassword, salt);

            let keypair = forge.pki.rsa.generateKeyPair({ bits: 4096, e: 0x10001 });

            const user = new User({
                name: employee.name,
                firstSurname: employee.firstSurname,
                secondSurname: employee.secondSurname,
                email: employee.email,
                companyId: admin.companyId,
                password: cpassword,
                publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
                privateKey: CryptoJS.AES.encrypt(forge.pki.privateKeyToPem(keypair.privateKey), randomPassword, { mode: CryptoJS.mode.CTR }).toString(),
                recoveryToken: crypto.randomBytes(16).toString('hex'),
                rol: "EMPLOYEE",
                isVerified: true,
            });
            const savedEmployee = await user.save();
            if (!savedEmployee) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error creando el usuario.'
                });
            }
            const updatedCompany = await Company.findByIdAndUpdate(admin.companyId, 
                {
                    $push: {employees: savedEmployee}
                }
            )
            if(!updatedCompany) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error creando el usuario.'
                });
            }
            let transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'be2pass2022@gmail.com', pass: 'lzhkfdorvkgsiocu' } });
            let mailOptions = { from: 'be2pass2022@gmail.com', to: savedEmployee.email, subject: 'Clave de inicio de sesión - Be2Pass', text: 'Muy buenas,\n\n' + 'Su contraseña es ' + randomPassword + '\nSi desea cambiarla por favor haga click en el siguiente enlace:\n' + process.env.HOST + '/password-recovery/' + savedEmployee.recoveryToken };
            transporter.sendMail(mailOptions, function(err) {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error en el envío del correo.'
                    });
                }
            });
            createdEmployees.push(savedEmployee);
        }
        res.json({
            ok: true,
            msg: 'Empleados creados con éxito',
            employees: createdEmployees,
        });
            
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando usuario'
        });
    }
}

const editEmployeeByAdmin = async(req, res = response) => {
    const token = req.header('x-token');
    const id = req.query.id;
    const { name, firstSurname, secondSurname, email, idAdmin } = req.body;
    try{
        if (!((infoToken(token).rol === 'COMPANY_MANAGER') || (infoToken(token).id === idAdmin))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar usuarios',
            });
        }
        const admin = await User.findById(idAdmin);
        if (!admin) {
            return res.status(400).json({
                ok: false,
                msg: 'Administrador de empresa no encontrado'
            });
        }
        const isExistingUser = await User.findById(id);
        if (!isExistingUser) {
            return res.status(400).json({
                ok: false,
                msg: 'El empleado no existe'
            });
        }
        const updatedEmployee = await User.findByIdAndUpdate(id, { name, firstSurname, secondSurname, email }, { new: true })
        if(!updatedEmployee) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al actualizar empleado'
            });
        }
        res.json({
            ok: true,
            msg: 'Empleado actualizado',
            employee: updatedEmployee
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error editando empleado'
        });
    }
}

const getEmployees = async(req, res = response) => {
    const token = req.header('x-token');
    const idAdmin = req.query.idAdmin;
    const companyId = req.query.companyId;
    try {
        if (!((infoToken(token).rol === 'COMPANY_MANAGER') || (infoToken(token).id === idAdmin) || (infoToken(token).companyId === companyId))) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para listar empleados',
            });
        }
        const employees = await User.find({ companyId: companyId });
        if(!employees) {
            return res.status(401).json({
                ok: false,
                msg: 'Error al obtener empleados',
            });
        }
        res.json({
            ok: true,
            msg: 'Empleados obtenidos con éxito',
            employees: employees.filter((employee) => employee.rol !== 'COMPANY_MANAGER')
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener empleados'
        });
    }
}

const getSharedEmployees = async(req, res = response) => {
    const token = req.header('x-token');
    const userId = req.query.userId;
    const companyId = req.query.companyId;
    try {
        if (!((infoToken(token).id === userId) || (infoToken(token).companyId === companyId))) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene permisos para listar empleados que le han compartido',
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(400).json({
                ok: false,
                msg: 'Empresa no encontrada'
            });
        }
        const keys = await Key.find({ userId: userId, ownerId: { $ne: userId } });
        if(!keys) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener empleados que le han compartido',
            });
        }
        const usersFormattedIds = keys.map((key) => ObjectID(key.ownerId))
        let usersFound = await User.find({ _id: {$in: usersFormattedIds}});
        if(!usersFound) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener empleados que le han compartido',
            });
        }
        res.json({
            ok: true,
            msg: 'Empleados que le han compartido obtenidos con éxito',
            employees: usersFound
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener empleados que le han compartido',
        });
    }
}

module.exports = { getUsers, createUser, createUserCompanyManager, getEmployees, editEmployeeByAdmin, getSharedEmployees }
