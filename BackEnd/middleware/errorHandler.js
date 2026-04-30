export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_ERROR";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
    code = "INVALID_ID";
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
    code = "DUPLICATE_FIELD";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[Error Handler]", {
      statusCode,
      message,
      code,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: "NOT_FOUND",
  });
};