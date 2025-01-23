const userModel = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });
};

// POST /api/v1/auth/signup
const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const user = await userModel.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }

  const user = await userModel.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  const token = signToken(user._id);
  res.json({
    status: 'success',
    token,
    data: { user },
  });
});

const protect = catchAsync(async function protect(req, _, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in.', 401));
  }

  // Check if token is valid
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  // check if user has changed password after token was issued
  if (user.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User has recently changed password. Please log in again.',
        401
      )
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized to access this route', 403));
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user by email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email'), 404);
  }

  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });


});

const resetPassword = catchAsync(async (req, res, next) => {
});


module.exports = { signup, login, protect, restrictTo, forgotPassword, resetPassword };
