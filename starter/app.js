const dotenv = require('dotenv');

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const app = express();
dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} 
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)  );
});

app.use(errorController);
module.exports = app;
