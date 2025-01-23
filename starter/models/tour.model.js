const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour mus have a difficulty'],
      enum: ['easy', 'medium', 'difficult'],
    },
    rating: {
      type: Number,
      default: 4.5,

    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
     validate: {
      // this only works on CREATE!!!
      validator: function (value) {
        return value < this.price;
      },
      message: 'Price discount ({VALUE}) should be lower than the regular price',
     },
    } ,
    summery: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    slug: String,
    startDates: [Date],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// middleware to calculate average rating before saving
tourSchema.pre('save', async function (next) {
  this.slugify(this.name, { lower: true });
  next();
});
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/* tourSchema.pre('post', function (next) {
  this.ratingsAverage =
    this.ratingsQuantity > 0
     ? (this.ratingsSum / this.ratingsQuantity).toFixed(2)
      : 0;
  next();
}); */

// Query middleware for filtering secret tours from the results of find queries
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// agregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
