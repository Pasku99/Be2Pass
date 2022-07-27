const { Schema, model } = require('mongoose');

const WorkGroupSchema = Schema({
    name: {
        type: String,
        require: true,
    },
    companyId: {
        type: String,
        require: true,
    },
    employees: [
        {
            type: Schema.Types.Mixed, ref: 'User'
        }
    ]
}, { collection: 'workgroups' });


WorkGroupSchema.method('toJSON', function() {
    const { _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('workgroups', WorkGroupSchema)