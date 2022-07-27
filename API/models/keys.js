const { Schema, model } = require('mongoose');

const KeysSchema = Schema({
    key: {
        type: String,
        require: true,
    },
    userId: {
        type: String,
        require: true
    },
    ownerId: {
        type: String,
        require: true
    },
    service: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    URL: {
        type: String,
        require: true
    },
    workGroupsIds: [
        {
            type: String
        }
    ]
}, { collection: 'keys' });


KeysSchema.method('toJSON', function() {
    const { _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Key', KeysSchema);