const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/authValidators');

router.post('/register', authRateLimiter(), registerRules, validate, authController.register);
router.post('/login', authRateLimiter(), loginRules, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate(), authController.me);

module.exports = router;
