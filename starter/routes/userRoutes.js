const express = require('express');
const userRouter = express.Router();
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe,
} = require('../controllers/authController');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

userRouter.route('/signup').post(signup);
userRouter.route('/login').post(login);
userRouter.route('/forgotPassword').post(forgotPassword);
userRouter.route('/resetPassword/:token').patch(resetPassword);
userRouter.route('/updatePassword').patch(protect, updatePassword);
userRouter.route('/updateMe').patch(protect, updateMe);
userRouter.route('/deleteMe').delete(protect, deleteMe);

userRouter.route('/').get(protect, getAllUsers).post(createUser);
userRouter.route('/:id');

module.exports = userRouter;
