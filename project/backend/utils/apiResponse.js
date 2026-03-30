class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200, meta = {}) {
    const response = {
      success: true,
      message,
      data,
    };
    if (Object.keys(meta).length > 0) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, data, page, limit, total, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
