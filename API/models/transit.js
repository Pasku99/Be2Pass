const { Schema, model } = require('mongoose');

const TransitSchema = Schema({
    keyId: {
        type: String,
        require: true,
    },
    key: {
        type: String,
        require: true,
    },
    senderId: {
        type: String,
        require: true,
    },
    receiverId: {
        type: String,
        require: true,
    },
}, { collection: 'transit' });


TransitSchema.method('toJSON', function() {
    const { _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('transit', TransitSchema)