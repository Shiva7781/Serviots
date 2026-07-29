const { body, param, query } = require('express-validator');

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['desk', 'meeting_room']).withMessage('type must be desk or meeting_room'),
  body('capacity').isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
  body('amenities').optional().isArray().withMessage('amenities must be an array'),
  body('amenities.*').optional().isString(),
  body('description').optional().isString(),
  body('location').optional().isString(),
  body('pricePerHour').optional().isFloat({ min: 0 }),
];

const updateRules = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('type').optional().isIn(['desk', 'meeting_room']),
  body('capacity').optional().isInt({ min: 1 }),
  body('amenities').optional().isArray(),
  body('amenities.*').optional().isString(),
  body('description').optional().isString(),
  body('location').optional().isString(),
  body('pricePerHour').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
];

const idRule = [param('id').isMongoId().withMessage('Invalid space id')];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('type').optional().isIn(['desk', 'meeting_room']),
  query('minCapacity').optional().isInt({ min: 1 }),
  query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
];

const availabilityQueryRules = [
  param('id').isMongoId(),
  query('date')
    .notEmpty()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date query param is required as YYYY-MM-DD'),
];

module.exports = { createRules, updateRules, idRule, listQueryRules, availabilityQueryRules };
