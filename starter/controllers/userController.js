const AppError = require('../utils/appError');
const userModel = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const getAllUsers = catchAsync(async (req, res, next) => {
  userModel.find().exec((err, users) => {
    if (err) {
      return next(new AppError(err.message, 500).send(res));
    }
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name ||!email ||!password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  const newUser = await userModel.create({ name, email, password  });
  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

module.exports = { getAllUsers, createUser, getUser };
