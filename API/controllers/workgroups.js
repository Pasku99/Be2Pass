const User = require('../models/users');
const Company = require('../models/companies');
const Workgroup = require('../models/workgroups');
const Key = require('../models/keys');
const { infoToken } = require('../helpers/info-token');
const { response } = require('express');
const { ObjectID } = require('bson');

const getWorkgroups = async(req, res = response) => {
    const token = req.header('x-token');
    const userId = req.params.userId;
    const companyId = req.params.companyId;
    try {
        if (!((infoToken(token).rol === 'COMPANY_MANAGER') || (infoToken(token).id === userId))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar grupos de trabajo',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const workgroups = await Workgroup.find({ companyId: companyId });
        if(!workgroups){
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener grupos de trabajo',
            });
        }
        let userWorkgroups = [];
        for(const workgroup of workgroups) {
            for(const employee of workgroup.employees) {
                if(user.id === employee.id) {
                    userWorkgroups.push(workgroup)
                }
            }
        }
        res.json({
            ok: true,
            msg: 'getWorkgroups',
            workgroups: userWorkgroups
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo grupos de trabajo'
        });
    }
}

const getWorkgroupsKeys = async(req, res = response) => {
    const token = req.header('x-token');
    const userId = req.params.userId;
    const companyId = req.params.companyId;
    const workgroupId = req.params.workgroupId;
    try {
        if (!((infoToken(token).id === userId) || (infoToken(token).companyId === companyId))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar grupos de trabajo',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const company = await Company.findById(companyId);
        if(!company) {
            return res.status(400).json({
                ok: false,
                msg: 'La empresa no existe',
            });
        }
        const keys = await Key.find({workGroupsIds: workgroupId});
        if(!keys) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener llaves',
            });
        }
        res.json({
            ok: true,
            msg: 'getWorkgroupKeys',
            keys: keys
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo llaves del grupo de trabajo'
        });
    }
}

const createWorkgroup = async(req, res = response) => {
    const token = req.header('x-token');
    const { name, companyId, userId, employeesIds } = req.body;
    try {
        if (!((infoToken(token).rol === 'COMPANY_MANAGER') || (infoToken(token).id === userId))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar grupos de trabajo',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const company = await Company.findById(companyId);
        if(!company) {
            return res.status(400).json({
                ok: false,
                msg: 'La empresa no existe',
            });
        }
        const employeesFormatedIds = (employeesIds.map((employee) => employee.id)).map(ObjectID)
        const employees = await User.find({ _id: { $in: employeesFormatedIds } });
        if(infoToken(token).rol === 'COMPANY_MANAGER') {
            employees.push(user);
        }
        const workgroup = new Workgroup({
            name: name,
            companyId: companyId,
            employees: employees.map((employee) => ({id: employee.id}))
        });
        const savedWorkgroup = await workgroup.save();
        if (!savedWorkgroup) {
            return res.status(500).json({
                ok: false,
                msg: 'Error creando el grupo de trabajo.'
            });
        }
        res.json({
            ok: true,
            msg: 'createWorkgroup',
            workgroup: savedWorkgroup
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando grupo de trabajo'
        });
    }
}

const getEmployeeWorkgroups = async(req, res = response) => {
    const token = req.header('x-token');
    const userId = req.params.userId;
    const companyId = req.params.companyId;
    try {
        if (!((infoToken(token).id === userId) || (infoToken(token).companyId === companyId))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar grupos de trabajo',
            });
        }
        const user = await User.findById(userId); 
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe',
            });
        }
        const company = await Company.findById(companyId); 
        if(!company) {
            return res.status(400).json({
                ok: false,
                msg: 'La empresa no existe',
            });
        }
        const workgroups = await Workgroup.find({ "employees.id": userId });
        if(!workgroups){
            return res.status(400).json({
                ok: false,
                msg: 'Error al obtener grupos de trabajo',
            });
        }
        res.json({
            ok: true,
            msg: 'getWorkgroups',
            workgroups: workgroups
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo grupos de trabajo'
        });
    }
}


module.exports = { getWorkgroups, getWorkgroupsKeys, createWorkgroup, getEmployeeWorkgroups }
