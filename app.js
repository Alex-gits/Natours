// Here we do everything concerning EXPRESS application
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorContoller = require('./controllers/errorContoller');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // Let us use req.body

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );

  next(err);
});

app.use(globalErrorContoller);

module.exports = app;
