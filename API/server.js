const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { dbConnection } = require('./database/configdb');

require('dotenv').config()

const app = express()

dbConnection();

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false,
        "block-all-mixed-content": true,
        "upgrade-insecure-requests": true,
        directives: {
            "default-src": [
                "'self'"
            ],
            "base-uri": "'self'",
            "font-src": [
                "'self'",
                "https:",
                "data:"
            ],
            "frame-ancestors": [
                "'self'"
            ],
            "img-src": [
                "'self'",
                "data:"
            ],
            "object-src": [
                "'none'"
            ],
            "script-src": [
                "'self'",
                "https://cdnjs.cloudflare.com"
            ],
            "script-src-attr": "'none'",
            "style-src": [
                "'self'",
                "https://cdnjs.cloudflare.com"
            ],
      },
    }
}));
app.use(cors());
app.use(express.json());

app.use('/api/v1/login', require('./routes/auth'))
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/keys', require('./routes/keys'));
app.use('/api/v1/workgroups', require('./routes/workgroups'));

app.use(express.static(path.join(__dirname, "public")));
    app.get("*", (req, res)=>{
    res.sendFile(path.join(__dirname, "public",'index.html'));
})

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT)
})
