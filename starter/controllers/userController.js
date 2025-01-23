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

const updateUser = catchAsync(async (req, res, next) => {
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

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, getUser };
