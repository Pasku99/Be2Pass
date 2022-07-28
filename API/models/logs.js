const { Schema, model } = require('mongoose');

const LogsSchema = Schema({
    companyId: {
        type: String,
        require: true,
    },
    level: {
        type: String,
        require: true,
    },
    IP: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        require: true,
    },
    date: {
        type: Date,
        require: true
    }
}, { collection: 'logs' });


LogsSchema.method('toJSON', function() {
    const { _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('logs', LogsSchema)