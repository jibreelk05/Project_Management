/**
 * Reusable query builder for filtering, searching, sorting, and pagination.
 * Combines role-based scoping (baseFilter) with user-requested query params safely via $and.
 */
class ApiFeatures {
  /**
   * @param {import('mongoose').Query} query - Mongoose Query object (e.g., Model.find())
   * @param {Object} queryString - Express req.query object
   * @param {Object} [baseFilter={}] - Role-scoping filter to preserve through all operations
   */
  constructor(query, queryString, baseFilter = {}) {
    this.query = query;
    this.queryString = queryString;
    this.filterObj = { ...baseFilter };
    this.paginationMeta = {};
  }

  /**
   * Parse user-provided filters from req.query, excluding meta params,
   * and merge them with the base (scoping) filter using $and.
   */
  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    const userFilterObj = { ...this.queryString };

    excludedFields.forEach((el) => delete userFilterObj[el]);

    // No user filters to add — keep only base scope
    if (Object.keys(userFilterObj).length === 0) return this;

    // Convert gte/gt/lte/lt to MongoDB operators ($gte/$gt/$lte/$lt)
    let queryStr = JSON.stringify(userFilterObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedFilters = JSON.parse(queryStr);

    // Merge with base scope using $and
    const conditions = [this.filterObj, parsedFilters].filter(
      (f) => Object.keys(f).length > 0
    );

    if (conditions.length === 1) {
      this.filterObj = conditions[0];
    } else {
      this.filterObj = { $and: conditions };
    }

    return this;
  }

  /**
   * Add case-insensitive regex $or search across the given text fields.
   * @param {string[]} fields - Model fields to search (e.g., ['title', 'description'])
   */
  search(fields = []) {
    if (!this.queryString.search || fields.length === 0) return this;

    const searchCond = {
      $or: fields.map((field) => ({
        [field]: { $regex: this.queryString.search, $options: 'i' },
      })),
    };

    if (Object.keys(this.filterObj).length > 0) {
      this.filterObj = { $and: [this.filterObj, searchCond] };
    } else {
      this.filterObj = searchCond;
    }

    return this;
  }

  /**
   * Apply multi-field sorting. Supports comma-separated fields.
   * Prefix a field with `-` for descending order. Default: `-createdAt`.
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query.sort(sortBy);
    } else {
      this.query.sort('-createdAt');
    }

    return this;
  }

  /**
   * Parse pagination params and set skip/limit on the query.
   * Defaults: page = 1, limit = 10. Caps limit at 100.
   */
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(this.queryString.limit, 10) || 10));
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);
    this.paginationMeta = { page, limit };

    return this;
  }

  /**
   * Count total documents matching the combined filter (before pagination).
   * Populates `total` and `pages` in paginationMeta.
   */
  async countTotal() {
    const total = await this.query.model.countDocuments(this.filterObj);
    const { page, limit } = this.paginationMeta;

    this.paginationMeta = {
      ...this.paginationMeta,
      total,
      pages: Math.ceil(total / limit),
    };

    return this;
  }

  /**
   * Finalize the filter conditions on the query and execute.
   * @returns {Promise<Array>} Resolved query results
   */
  async exec() {
    this.query.find(this.filterObj);
    return this.query.exec();
  }
}

export default ApiFeatures;