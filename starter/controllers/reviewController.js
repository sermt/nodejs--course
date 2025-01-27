const Review = require('../models/review.model');
const catchAsync = require('../utils/catchAsync');

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
});

const createReview = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.user.user = req.user._id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  
  const { tour, user, ...reviewFields } = req.body;
  const newReview = await Review.create({ ...reviewFields, tour, user });
  
  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});

module.exports = { getAllReviews, createReview };
