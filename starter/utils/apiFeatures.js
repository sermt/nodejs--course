class APIFeatures {
    constructor(query, queryString, model) {
      this.query = query;
      this.queryString = queryString;
      this.model = model;
    }
  
    filter() {
      const filters = {};
      const { name, price, ratingMin, ratingMax, difficulty } = this.queryString;
      if (name) filters.name = name;
      if (price) {
        const [minPrice, maxPrice] = price.split(',');
        filters.price = {};
        if (minPrice) filters.price.$gte = minPrice;
        if (maxPrice) filters.price.$lte = maxPrice;
      }
      if (ratingMin) filters.rating = { $gte: ratingMin };
      if (ratingMax) filters.rating = { $lte: ratingMax };
      if (difficulty) filters.difficulty = difficulty;
  
      // filter fields
      this.query.find(filters);
      return this;
    }
  
    sort() {
      const { sort } = this.queryString;
      // sorting
      if (sort) {
        const sortBy = sort.replace(/,/g, ' ');
        this.query.sort(sortBy);
      } else {
        this.query.sort('-createdAt');
      }
      return this;
    }
  
    async paginate() {
      //pagination
      const page = parseInt(this.query.page) || 1;
      const limit = parseInt(this.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      this.query.skip(skip).limit(limit);
  
      if (this.query.page) {
        const modelCount = await model.countDocuments(filters);
        if (skip >= modelCount) {
          return res.status(404).json({
            status: 'fail',
            message: 'This page does not exist',
          });
        }
      }
      return this;
    }
  
    excludeFields() {
      const fieldsToExclude = '-__v -createdAt -updatedAt';
      this.query.select(fieldsToExclude);
      return this;
    }
  }


  module.exports = APIFeatures;