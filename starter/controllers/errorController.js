const AppError = require('../utils/appError');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

function handleProdError(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error occurred:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong, please try again later.',
    });
  }
}

function handleValidationError(err) {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = errors.join(', ');
  return new AppError(message, 400);
}

function handleCastError(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.code === 11000)
      err = new AppError('Duplicate field value entered', 400);
    if (err.name === 'ValidationError') err = handleValidationError(err);

    handleProdError(err, res);
  }
};
