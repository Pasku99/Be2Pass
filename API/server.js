const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { dbConnection } = require('./database/configdb');

require('dotenv').config()

const app = express()

dbConnection();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/login', require('./routes/auth'))
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/keys', require('./routes/keys'));
app.use('/api/v1/workgroups', require('./routes/workgroups'));

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT)
})
