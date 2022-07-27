const { response } = require('express');
const { validationResult } = require('express-validator');

const validateFields = (req, res = response, next) => {
    const valErrors = validationResult(req);
    if (!valErrors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            msg: 'Argumentos recibidos inválidos',
            errors: valErrors.mapped()
        });
    }
    next();

}

module.exports = { validateFields }