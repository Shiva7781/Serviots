const { body, param, query } = require('express-validator');

const createRules = [
  body('space').isMongoId().withMessage('Valid space id is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startTime must be HH:MM'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endTime must be HH:MM'),
  body('purpose').optional().isString().isLength({ max: 300 }),
];

const idRule = [param('id').isMongoId().withMessage('Invalid booking id')];

const myBookingsQueryRules = [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const adminListQueryRules = [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('space').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const rejectRules = [
  param('id').isMongoId(),
  body('reason').optional().isString().isLength({ max: 300 }),
];

const maintenanceRules = [
  body('space').isMongoId().withMessage('Valid space id is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startTime must be HH:MM'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endTime must be HH:MM'),
  body('reason').optional().isString().isLength({ max: 300 }),
];

module.exports = {
  createRules,
  idRule,
  myBookingsQueryRules,
  adminListQueryRules,
  rejectRules,
  maintenanceRules,
};
