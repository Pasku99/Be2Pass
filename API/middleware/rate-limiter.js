const{ rateLimit } = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 60000, // 1 min in ms
  max: 5,
  message: 'Has sobrepasado las peticiones por minuto', 
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter }
