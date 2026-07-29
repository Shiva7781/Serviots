const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, idRule, myBookingsQueryRules } = require('../validators/bookingValidators');

router.use(authenticate(), authorize('member'));

router.post('/', createRules, validate, bookingController.create);
router.get('/mine', myBookingsQueryRules, validate, bookingController.myBookings);
router.patch('/:id/cancel', idRule, validate, bookingController.cancel);

module.exports = router;
