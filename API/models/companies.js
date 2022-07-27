const { Schema, model } = require('mongoose');

const CompanySchema = Schema({
    TIN: {
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true,
    },
    country: {
        type: String,
        require: true
    },
    employees: [
        {
            type: Schema.Types.Mixed, ref: 'User'
        }
    ]
}, { collection: 'companies' });


CompanySchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Company', CompanySchema);