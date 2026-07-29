const router = require('express').Router();
const adminController = require('../controllers/adminController');
const spaceController = require('../controllers/spaceController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  idRule,
  adminListQueryRules,
  rejectRules,
  maintenanceRules,
} = require('../validators/bookingValidators');
const { listQueryRules } = require('../validators/spaceValidators');

router.use(authenticate(), authorize('admin'));

router.get('/spaces', listQueryRules, validate, spaceController.adminList);

router.get('/bookings', adminListQueryRules, validate, adminController.listBookings);
router.patch('/bookings/:id/approve', idRule, validate, adminController.approve);
router.patch('/bookings/:id/reject', rejectRules, validate, adminController.reject);

router.post('/maintenance', maintenanceRules, validate, adminController.createMaintenance);
router.get('/maintenance', adminController.listMaintenance);
router.delete('/maintenance/:id', idRule, validate, adminController.removeMaintenance);

module.exports = router;
