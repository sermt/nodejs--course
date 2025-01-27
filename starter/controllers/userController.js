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

const getUserById = catchAsync(async (req, res, next) => {
  const decodedId = req.user._id;
  if (decodedId !== req.params.id) {
    return next(new AppError('Unauthorized', 401));
  }
  const user = await userModel.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status:'success',
    data: user,
  });
});

module.exports = { getAllUsers, createUser, getUserById }; 
