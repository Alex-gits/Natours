const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleDublicateFieldsDB = err => {
  const duplicate = Object.keys(err.keyValue)[0];
  const errMessage = `Provided '${duplicate}' is already taken. Please use another value!`;

  return new AppError(errMessage, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(
    error => error.properties.message
  );

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError(`Invalid token. Please log in again!`, 401);
};

const handleJWTExpiredError = () => {
  return new AppError(`Your token has expried. Please log in again!`, 401);
};

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send details to client
  if (err.isOperational) {
    const message = err.message || 'Invalid url';

    res.status(err.statusCode).json({
      status: err.status,
      message
    });

    // Programming or other unknown error: don't want to leak details to client
  } else {
    // Log the error for ourselves
    console.error('ERROR', err);

    // Send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.message) error.message = err.message;

    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDublicateFieldsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
