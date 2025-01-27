const express = require('express');
const reviewRouter = express.Router();
const {
  createReview,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

reviewRouter.use(protect);
reviewRouter
  .route('/')
  .get(restrictTo('user'), getAllReviews)
  .post(restrictTo('user'), createReview);

module.exports = reviewRouter;
