const { Schema, model } = require('mongoose');

const AccountSchema = Schema({
    number: {
        type: String,
        require: true,
        unique: true,
    },
    total: {
        type: Number,
        require: true
    },
    userId: {
        type: String,
        require: true
    },
    isMain: {
        type: Boolean,
        require: true
    }
}, { collection: 'accounts' });


AccountSchema.method('toJSON', function() {
    const { _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Account', AccountSchema);