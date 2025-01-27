const mongoose = require('mongoose');
const Tour = require('../models/tour.model');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware para popular información de 'tour' y 'user'
reviewSchema.pre(/^find/, function (next) {
  /*   this.populate({
      path: 'tour',
      select: 'name description price ratingAverage', 
      populate: {
        path: 'guides',
        select: 'name', 
      },
    }) */
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  next();
});

reviewSchema.statics.calcAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.pre('/^findOneAnd/', async function (next) {
  this.reviewFound = this.findOne();
  next();
});

reviewSchema.post('/^findOneAnd/', async function (next) {
  await this.reviewFound.constructor.calcAvgRating(this.reviewFound.tour);
  next();
});

reviewSchema.post('save', async function (next) {
  this.constructor.calcAvgRating(this.tour);
  next();
});


// unique review per user per tour
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
