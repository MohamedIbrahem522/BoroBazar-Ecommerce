export class AppError extends Error {
  constructor(message, statusCode = 400, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTH_FAILED");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message: error.message,
    code: error.code || "ERROR",
  });
};