const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Tour = require('../models/tour.model');

const catchAsync = (fn) => {
  return async (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

const createTour = catchAsync(async (req, res, next) => {
  const {
    name,
    price,
    duration,
    maxGroupSize,
    difficulty,
    description,
    images,
    ratingAverage,
    ratingQuantity,
    difficultyLevel,
  } = req.body;
  const newTour = await Tour.create({
    name,
    price,
    duration,
    maxGroupSize,
    difficulty,
    description,
    images,
    ratingAverage,
    ratingQuantity,
    difficultyLevel,
  });

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getAllTours = async (req, res) => {
  const apiFeatures = await new APIFeatures(Tour.find(), req.query, Tour)
    .filter()
    .sort()
    .excludeFields()
    .paginate();
  const query = apiFeatures.query;

  const tours = await query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    throw new Error(new AppError('Tour not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const aliasTopTours = async (req, res, next) => {
  try {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage, price';
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Server error',
    });
  }
};

const getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgRating: 1 } },
    ]);
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Server error',
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    //const month = req.params.month * 1 - 1;
    const tours = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$startDates' },
            year: { $year: '$startDates' },
          },
          numTours: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.month': 1, '_id.year': 1 },
      },

      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          numTours: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: tours,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Server error',
    });
  }
};

module.exports = {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkBody,
  getToursStats,
  getMonthlyPlan,
};
