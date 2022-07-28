const { Router } = require('express');
const { createUser, createUserCompanyManager, getEmployees, editEmployeeByAdmin, getSharedEmployees, getAdminLogs } = require('../controllers/users');
const { check } = require('express-validator');
const { validateJWT } = require('../middleware/validate-JWT');
const { validateFields } = require('../middleware/validate-fields');

const router = Router();

router.get('/', [
    validateJWT,
    check('idAdmin', 'El id de administrador es obligatorio').not().isEmpty().isMongoId(),
    check('companyId', 'El id de empresa es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getEmployees);

router.post('/', [
    check('idAdmin', 'El id de administrador es obligatorio').not().isEmpty().isMongoId(),
    check('employees.*.name', 'El argumento email debe ser un email').not().isEmpty().isString().isLength({max: 20}),
    check('employees.*.firstSurname', 'El argumento firstSurname debe ser un firstSurname').not().isEmpty().isString().isLength({max: 20}),
    check('employees.*.secondSurname', 'El argumento secondSurname debe ser un secondSurname').optional({nullable: true}).isString().isLength({max: 20}),
    check('employees.*.email', 'El argumento email debe ser un email').not().isEmpty().isEmail(),
    validateFields,
], createUser);

router.put('/employee', [
    check('idAdmin', 'El id de administrador es obligatorio').not().isEmpty().isMongoId(),
    check('name', 'El nombre debe ser una cadena').not().isEmpty().isString().isLength({max: 20}),
    check('firstSurname', 'El argumento firstSurname debe ser un firstSurname').not().isEmpty().isString().isLength({max: 20}),
    check('secondSurname', 'El argumento secondSurname debe ser un secondSurname').optional({nullable: true}).isString().isLength({max: 20}),
    check('email', 'El argumento email debe ser un email').not().isEmpty().isEmail(),
    validateFields,
], editEmployeeByAdmin);


router.post('/manager', [
    check('name', 'El nombre es obligatorio').not().isEmpty().isString().isLength({max: 20}),
    check('firstSurname', 'El primer apellido es obligatorio').not().isEmpty().isString().isLength({max: 20}),
    check('secondSurname', 'El segundo apellido no es correcto').optional().isString().isLength({max: 20}),
    check('TIN', 'El TIN debe ser un identificador').not().isEmpty().isAlphanumeric().isLength({min: 7, max: 10}),
    check('email', 'El email debe ser un email').not().isEmpty().isEmail().isLength({max: 20}),
    check('companyName', 'El nombre de la compañía es obligatorio').not().isEmpty().isString().isLength({max: 20}),
    check('companyTIN', 'El identificador de la empresa es obligatorio').not().isEmpty().isAlphanumeric().isLength({min: 7, max: 10}),
    check('companyCountry', 'El país de la empresa es obligatorio').not().isEmpty().isString().isLength({max: 20}),
    check('password', 'La contraseña ha de tener mínimo 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos').not().isEmpty().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
    check('confirmPassword', 'La contraseña ha de tener mínimo 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos').not().isEmpty().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
    validateFields,
], createUserCompanyManager);

router.get('/shared', [
    validateJWT,
    check('userId', 'El id de usuario es obligatorio').not().isEmpty().isMongoId(),
    check('companyId', 'El id de empresa es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getSharedEmployees);

router.get('/logs', [
    validateJWT,
    check('userId', 'El id de usuario es obligatorio').not().isEmpty().isMongoId(),
    check('companyId', 'El id de empresa es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getAdminLogs);

module.exports = router;
