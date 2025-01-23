const express = require('express');
const tourRouter = express.Router();
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
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
//tourRouter.route('/:id/reviews').post(createReview);

module.exports = tourRouter;
