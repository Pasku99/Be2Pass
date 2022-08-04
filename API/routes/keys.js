const { Router } = require('express');
const { check } = require('express-validator');
const { validateJWT } = require('../middleware/validate-JWT');
const { validateFields } = require('../middleware/validate-fields');
const { getMyKeys, createKey, editKey, createWorkgroupKey, shareKey, transit, acceptKey, getSharedKeys } = require('../controllers/keys');

const router = Router();

router.get('/', [
    validateJWT,
    check('id', 'El id es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getMyKeys);

router.post('/', [
    validateJWT,
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('key', 'La key es obligatoria').not().isEmpty().isString().isLength({max: 150}),
    check('service', 'El servicio es obligatorio').not().isEmpty().isString().isLength({max: 25}),
    check('username', 'El nombre de usuario o email es obligatorio').optional().isString().isLength({max: 25}),
    check('URL', 'La URL es obligatoria').not().isEmpty().isURL(),
    check('workGroupsIds.*', 'El id del grupo de trabajo ha de ser id').optional().isMongoId(),
    validateFields,
], createKey);

router.post('/workgroup/:workgroupId', [
    validateJWT,
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('key', 'La key es obligatoria').not().isEmpty().isString().isLength({max: 150}),
    check('service', 'El servicio es obligatorio').not().isEmpty().isString().isLength({max: 25}),
    check('username', 'El nombre de usuario o email es obligatorio').optional().isString().isLength({max: 25}),
    check('URL', 'La URL es obligatoria').not().isEmpty().isURL(),
    check('workgroupId', 'El id del grupo de trabajo es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], createWorkgroupKey);

router.put('/', [
    validateJWT,
    check('keyId', 'La id de la key es obligatoria').not().isEmpty().isMongoId(),
    check('userId', 'El id del usuario es obligatorio').not().isEmpty().isMongoId(),
    check('key', 'La key es obligatoria').not().isEmpty().isString().isLength({max: 150}),
    check('service', 'El servicio es obligatorio').not().isEmpty().isString().isLength({max: 25}),
    check('username', 'El nombre de usuario o email es obligatorio').optional().isString().isLength({max: 25}),
    check('URL', 'La URL es obligatoria').not().isEmpty().isURL(),
    check('isShared', 'La opción de compartir ha de ser booleano').optional().isBoolean(),
    check('workgroups.*.id', 'El id del grupo de trabajo ha de ser id').optional().isMongoId(),
    validateFields,
], editKey);

router.post('/share', [
    validateJWT,
    check('keyId', 'El id de la clave es obligatorio').not().isEmpty().isString().isLength({max: 150}),
    check('senderId', 'El id del emisor es obligatorio').not().isEmpty().isMongoId(),
    check('transits.*.companyId', 'Los ids de empresa son obligatorios').not().isEmpty().isMongoId(),
    check('transits.*.receiverId', 'Los ids de receptor son obligatorios').not().isEmpty().isMongoId(),
    check('transits.*.encryptedKey', 'La clave es obligatoria').not().isEmpty().isString(),
    validateFields,
], shareKey);

router.get('/transit/:userId', [
    validateJWT,
    check('userId', 'El id es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], transit);

router.post('/transit/:transitId/sender/:senderId/receiver/:receiverId', [
    validateJWT,
    check('transitId', 'El id de tránsito es obligatorio').not().isEmpty().isMongoId(),
    check('senderId', 'El id de emisor es obligatorio').not().isEmpty().isMongoId(),
    check('receiverId', 'El id de receptor es obligatorio').not().isEmpty().isMongoId(),
    check('encryptedUserKey', 'La clave es obligatoria').not().isEmpty().isString(),
    validateFields,
], acceptKey);

router.get('/shared/company/:companyId/user/:userId/owner/:ownerId', [
    validateJWT,
    check('companyId', 'El id de empresa es obligatorio').not().isEmpty().isMongoId(),
    check('userId', 'El id de usuario es obligatorio').not().isEmpty().isMongoId(),
    check('ownerId', 'El id de dueño es obligatorio').not().isEmpty().isMongoId(),
    validateFields,
], getSharedKeys);

module.exports = router;
