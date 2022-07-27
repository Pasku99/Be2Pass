const jwt = require('jsonwebtoken');

const generateJWT = (id, rol) => {

    return new Promise((resolve, reject) => {

        const payload = {
            id,
            rol
        }

        jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: '1h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el JWT');
            } else {
                resolve(token);
            }
        });

    });
}

module.exports = { generateJWT }