const express = require('express');
const userRouter = express.Router();
const {
  signup,
  login,
  protect,
  restrictTo,
} = require('../controllers/authController');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');

userRouter.route('/signup').post(signup);
userRouter.route('/login').post(login);
userRouter.route('/login').post(login);
userRouter.route('/login').post(login);
userRouter.route('/forgotPassword').post(forgotPassword);
userRouter.route('/resetPassword').post(resetPassword);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter
  .route('/:id')
  .get(getUser)
  .patch(protect, restrictTo, restrictTo('user', 'admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = userRouter;
