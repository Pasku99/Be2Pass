const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    TIN: {
        type: String
    },
    name: {
        type: String,
        require: true
    },
    firstSurname: {
        type: String,
        require: true
    },
    secondSurname: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    companyId: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    creation_date: {
        type: Date,
        default: Date.now
    },
    recoveryToken: {
        type: String,
        default: '',
    },
    rol: {
        type: String,
        require: true,
        default: 'ROL_CLIENT'
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    publicKey: {
        type: String, 
        require: true,
    },
    privateKey: {
        type: String,
        require: true,
    }
}, { collection: 'users' });


UserSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('User', UserSchema);