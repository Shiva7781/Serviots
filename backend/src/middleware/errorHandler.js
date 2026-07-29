const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let { statusCode, message, details } = err instanceof ApiError ? err : { statusCode: 500, message: err.message };

  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value violates a unique constraint';
    details = err.keyValue;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  statusCode = statusCode || 500;
  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: message || 'Internal server error',
      status: statusCode,
      ...(details ? { details } : {}),
    },
  });
}

module.exports = { errorHandler, notFoundHandler };
