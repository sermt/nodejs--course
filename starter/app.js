const dotenv = require('dotenv');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

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

// set secure HTTP headers
app.use(helmet());

// log requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiter middleware

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// serve static files from the public directory
app.use(express.static(`${__dirname}/public`));

// body parser, reading data from body into req.body
app.use(express.json({ limit: '100kb' }));

// data sanitization
app.use(mongoSanitizer());

// data sanitization against XSS attacks
app.use(xss());

// prevent parameter pollution
app.use(hpp(
  {
    whitelist: [],
  }
)); 

// mounting routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);
module.exports = app;
