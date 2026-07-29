const router = require('express').Router();
const spaceController = require('../controllers/spaceController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createRules,
  updateRules,
  idRule,
  listQueryRules,
  availabilityQueryRules,
} = require('../validators/spaceValidators');

router.get('/', listQueryRules, validate, spaceController.list);
router.get('/:id', idRule, validate, spaceController.getById);
router.get('/:id/availability', availabilityQueryRules, validate, spaceController.availability);

router.post(
  '/',
  authenticate(),
  authorize('admin'),
  createRules,
  validate,
  spaceController.create
);
router.patch(
  '/:id',
  authenticate(),
  authorize('admin'),
  updateRules,
  validate,
  spaceController.update
);
router.delete('/:id', authenticate(), authorize('admin'), idRule, validate, spaceController.remove);

module.exports = router;
