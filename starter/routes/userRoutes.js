const express = require('express');
const userRouter = express.Router({ mergeParams: true  });
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
  createReview,
  getAllReviews,
} = require('../controllers/reviewController');
const {
  getAllUsers,
  createUser,
  getUserById,
} = require('../controllers/userController');

// User routes
userRouter.route('/signup').post(signup);
userRouter.route('/login').post(login);
userRouter.route('/forgotPassword').post(forgotPassword);
userRouter.route('/resetPassword/:token').patch(resetPassword);
userRouter.route('/updatePassword').patch(protect, updatePassword);
userRouter.route('/updateMe').patch(protect, updateMe);
userRouter.route('/deleteMe').delete(protect, deleteMe);

// it is recommended to use getMe instead of protect for getting user's own data
userRouter.use(restrictTo('admin'));
userRouter.route('/').get(protect, getAllUsers).post(createUser);
userRouter.route('/:id').get(protect,getUserById);
userRouter
  .route('/:id/reviews')
  .get(protect,getAllReviews)
  .post(protect,createReview);

module.exports = userRouter;
