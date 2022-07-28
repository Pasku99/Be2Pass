const Key = require('../models/keys');
const User = require('../models/users');
const Company = require('../models/companies');
const WorkGroup = require('../models/workgroups');
const Transit = require('../models/transit');
const { infoToken } = require('../helpers/info-token');
const { mapKeys } = require('../helpers/map-keys');
const { response } = require('express');
const { ObjectID } = require('bson');

const getMyKeys = async(req, res = response) => {
    const token = req.header('x-token');
    const id = req.query.id;

    try {
        if (!(infoToken(token).id === id)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar claves',
            });
        }
        const user = await User.findById(id); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const keys = await Key.find({ userId: user.id, ownerId: user.id });
        if(!keys) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener claves',
            });
        }
        res.json({
            ok: true,
            msg: 'getMyKeys',
            keys: await mapKeys(keys)
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo llaves propias'
        });
    }
}

const createKey = async(req, res = response) => {
    const token = req.header('x-token');
    const { userId, key, username, service, URL, isShared, workGroupsIds } = req.body;
    try {        
        if (!(infoToken(token).id === userId)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para inserta una clave',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        let workGroupsFound = [];
        if(workGroupsIds.length > 0) {
            const workGroupsFormattedIds = workGroupsIds.map(ObjectID)
            workGroupsFound = await WorkGroup.find({ _id: {$in: workGroupsFormattedIds}});
            if(!workGroupsFound) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El/los grupos de trabajo no existen',
                });
            }
        }
        // Create new key
        const newKey = new Key({
            key: key,
            userId: user.id,
            ownerId: user.id,
            service,
            username,
            URL,
            isShared,
            workGroupsIds: workGroupsFound.map((workGroup) => workGroup.id),
        })

        const savedKey = await newKey.save();
        if(!savedKey) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al guardar clave',
            });
        }
        res.json({
            ok: true,
            msg: 'createdKey',
            key: {  id: savedKey.id,
                    key: savedKey.key,
                    user: user,
                    username: savedKey.username,
                    service: savedKey.service,
                    URL: savedKey.URL,
                    isShared: savedKey.isShared,
                    workGroups: workGroupsFound
                }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo llaves propias'
        });
    }
}

const createWorkgroupKey = async(req, res = response) => {
    const token = req.header('x-token');
    const workgroupId = req.params.workgroupId;
    const { userId, key, username, service, URL, isShared } = req.body;
    try {        
        if (!(infoToken(token).id === userId)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para inserta una clave',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const workgroup = await WorkGroup.findById(workgroupId);
        if(!workgroup) {
            return res.status(400).json({
                ok: false,
                msg: 'El grupo de trabajo no existe',
            });
        }
        // Create new key
        const newKey = new Key({
            key: key,
            userId: user.id,
            ownerId: user.id,
            service,
            username,
            URL,
            isShared,
            workGroupsIds: [workgroup.id],
        })

        const savedKey = await newKey.save();
        if(!savedKey) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al guardar clave',
            });
        }
        res.json({
            ok: true,
            msg: 'createdKey',
            key: {  id: savedKey.id,
                    key: savedKey.key,
                    user: user,
                    owner: user,
                    username: savedKey.username,
                    service: savedKey.service,
                    URL: savedKey.URL,
                    isShared: savedKey.isShared,
                    workGroups: [workgroupId]
                }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo llaves propias'
        });
    }
}

const editKey = async(req, res = response) => {
    const token = req.header('x-token');
    const keyId = req.query.keyId;
    const { userId, key, username, service, URL, isShared, workGroups } = req.body;
    try {        
        if (!(infoToken(token).id === userId)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para editar la clave',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        
        let workGroupsFound = [];
        if(workGroups.length > 0) {
            workGroupsFound = await WorkGroup.findById(workGroups.map((workGroup) => workGroup.id))
            if(!workGroupsFound) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El/los grupos de trabajo no existen',
                });
            }
        }
        const updatedKey = await Key.findByIdAndUpdate(keyId, {
            key: key,
            username: username,
            service: service,
            URL: URL,
            isShared: isShared,
            workGroup: workGroupsFound
        }, { new: true });
        if(!updatedKey){
            return res.status(400).json({
                ok: false,
                msg: 'Error al actualizar clave',
            });
        }

        res.json({
            ok: true,
            msg: 'updatedKey',
            key: {  id: updatedKey.id,
                    key: updatedKey.key,
                    user: user,
                    username: updatedKey.username,
                    service: updatedKey.service,
                    URL: updatedKey.URL,
                    isShared: updatedKey.isShared,
                    workGroup: workGroupsFound
                }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo llaves propias'
        });
    }
}

const shareKey = async(req, res = response) => {
    const token = req.header('x-token');
    const { keyId, transits, senderId } = req.body;
    try {        
        if (!(infoToken(token).id === senderId)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para compartir la clave',
            });
        }
        const sender = await User.findById(senderId); 
        if(!sender) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        let receiversFound = [];
        if(transits.length > 0) {
            const receiversFormattedIds = transits.map((transit) => ObjectID(transit.receiverId))
            receiversFound = await User.find({ _id: {$in: receiversFormattedIds}});
            if(!receiversFound) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El/los receptores no existen',
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                msg: 'Error al compartir clave',
            });
        }
        for(const receiver of transits) {
            if(receiver.companyId !== sender.companyId) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error compartiendo clave'
                });
            }
            const transit = new Transit(
                {
                    keyId: keyId,
                    key: receiver.encryptedKey,
                    senderId: senderId,
                    receiverId: receiver.receiverId,
                }
            );

            const transitSaved = await transit.save();
            if(!transitSaved) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error compartiendo clave'
                });
            }
        }   
        res.json({
            ok: true,
            msg: 'sharedKey',
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error compartiendo clave'
        });
    }
}

const transit = async(req, res = response) => {
    const token = req.header('x-token');
    const userId = req.params.userId;
    try {        
        if (!(infoToken(token).id === userId)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para recibir notificaciones',
            });
        }
        const receiver = await User.findById(userId); 
        if(!receiver) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const transits = await Transit.find({  receiverId: new ObjectID(receiver.id) });
        if(!transits) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener notificaciones',
            });
        }
        let allTransits = [];
        for(const transit of transits) {
            allTransits.push({id: transit.id, key: transit.key, sender: await User.findById(transit.senderId), receiver: receiver})
        }
        res.json({
            ok: true,
            msg: 'transit',
            transits: allTransits 
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error compartiendo clave'
        });
    }
}

const acceptKey = async(req, res = response) => {
    const token = req.header('x-token');
    const transitId = req.params.transitId;
    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;   
    const { encryptedUserKey } = req.body; 
    try {        
        if (!(infoToken(token).id === receiverId)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para recibir claves',
            });
        }
        const transit = await Transit.findById(transitId);
        if(!transit) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al aceptar clave',
            });
        }
        const receiver = await User.findById(receiverId); 
        if(!receiver) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const sender = await User.findById(senderId); 
        if(!sender) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }

        const originalKey = await Key.findById(transit.keyId);
        if(!originalKey) {
            return res.status(400).json({
                ok: false,
                msg: 'Error recibiendo clave'
            });
        }

        const newKeyShared = new Key({
            key: encryptedUserKey,
            userId: receiver.id,
            ownerId: sender.id,
            service: originalKey.service,
            username: originalKey.username,
            URL: originalKey.URL,
            workGroupsIds: originalKey.workGroupsIds
        });
        const savedKey = await newKeyShared.save();
        if(!savedKey) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al recibir clave',
            });
        }
        const removeTransit = await Transit.deleteOne({_id: transit.id});
        if(!removeTransit) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al recibir clave',
            });
        }
        res.json({
            ok: true,
            msg: 'Received key',
            key: savedKey
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error recibiendo clave'
        });
    }
}

const getSharedKeys = async(req, res = response) => {
    const token = req.header('x-token');
    const userId = req.params.userId;
    const ownerId = req.params.ownerId;
    const companyId = req.params.companyId;
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
        const owner = await User.findById(ownerId);
        if (!owner) {
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
        const keys = await Key.find({ userId: userId, ownerId: ownerId });
        if(!keys) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener claves compartidas',
            });
        }
        res.json({
            ok: true,
            msg: 'Claves compartidas obtenidas con éxito',
            keys: keys
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener claves compartidas',
        });
    }
}

module.exports = { getMyKeys, createKey, editKey, createWorkgroupKey, shareKey, transit, acceptKey, getSharedKeys }