const { Router } = require('express');
const { check } = require('express-validator');
const { token, login, passwordRecovery, sendEmailRecovery } = require('../controllers/auth');
const { rateLimiter } = require('../middleware/rate-limiter');
const { validateFields } = require('../middleware/validate-fields');

const router = Router();

router.get('/token', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validateFields,
], token);

router.post('/', [
    check('email', 'El email es obligatorio').not().isEmpty().isEmail(),
    check('password', 'La contraseña es obligatorio').not().isEmpty().isString({minLength: 8}),
    rateLimiter,
    validateFields,
], login);

router.put('/password-recovery', [
    check('recoveryToken', 'El token es incorrecto').not().isEmpty().isString().isLength({min: 5}),
    check('password', 'La contraseña ha de tener mínimo 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos').not().isEmpty().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
    check('confirmPassword', 'La contraseña ha de tener mínimo 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos').not().isEmpty().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
    validateFields,
], passwordRecovery);

router.post('/password-recovery', [
    check('email', 'El argumento email es obligatorio').not().isEmpty().isEmail(),
    validateFields,
], sendEmailRecovery);


module.exports = router;