const express = require('express');
const tourRouter = express.Router({ mergeParams: true  });
const {protect, restrictTo, } =  require('../controllers/authController');
const {createReview, getAllReviews} = require('../controllers/reviewController');
const {
  aliasTopTours,
  getAllTours,
  getToursStats,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkBody,
  getMonthlyPlan,
} = require('../controllers/tourController');

tourRouter.route('/stats').get(getToursStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);
tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/').get(getAllTours).post(checkBody, createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(protect, restrictTo('admin'), deleteTour);
tourRouter.route('/:tourId/reviews').get(protect, restrictTo('user'),getAllReviews).post(protect, restrictTo('user'), createReview);
//tourRouter.route('/:id/reviews').post(createReview);

module.exports = tourRouter;
