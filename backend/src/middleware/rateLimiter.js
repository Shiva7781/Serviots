const rateLimit = require('express-rate-limit');

function authRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: {
          message: 'Too many attempts, please try again later.',
          status: 429,
        },
      });
    },
  });
}

module.exports = { authRateLimiter };
