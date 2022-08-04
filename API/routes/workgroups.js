const { Router } = require('express');
const { check } = require('express-validator');
const { validateJWT } = require('../middleware/validate-JWT');
const { validateFields } = require('../middleware/validate-fields');
const { createWorkgroup, getWorkgroups, getWorkgroupsKeys, getEmployeeWorkgroups } = require('../controllers/workgroups');

const router = Router();

router.get('/company/:companyId/user/:userId', [
    validateJWT,
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('companyId', 'El id de la empresa es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getWorkgroups);

router.get('/employee/company/:companyId/user/:userId', [
    validateJWT,
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('companyId', 'El id de la empresa es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getEmployeeWorkgroups);

router.get('/company/:companyId/user/:userId/workgroup/:workgroupId', [
    validateJWT,
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('companyId', 'El id de la empresa es obligatorio').not().isEmpty().isMongoId(),
    check('workgroupId', 'El id del grupo de trabajo es obligatorio').not().isEmpty().escape().isMongoId(),
    validateFields,
], getWorkgroupsKeys);

router.post('/', [
    validateJWT,
    check('name', 'El nombre es obligatorio').not().isEmpty().isString().isLength({max: 100}),
    check('companyId', 'El id de la empresa es obligatorio').not().isEmpty().isMongoId(),
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('employeesIds', 'Ha de ser un listado de empleados').optional().isArray(),
    check('employeesIds.*.id', 'El id del empleado ha de ser id').optional().isMongoId(),
    validateFields,
], createWorkgroup);

module.exports = router;
