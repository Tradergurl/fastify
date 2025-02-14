export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

export interface AppErrorOptions {
  code?: string;
  details?: ValidationErrorDetail[] | any;
  cause?: Error;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ValidationErrorDetail[] | any;
  public readonly cause?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    options: AppErrorOptions = {}
  ) {
    super(message);

    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code || `E${statusCode}`;
    this.details = options.details;
    this.cause = options.cause;
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    details: ValidationErrorDetail[]
  ) {
    super(message, 400, {
      code: "E400_VALIDATION",
      details,
    });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    code: string = "E404_NOT_FOUND"
  ) {
    super(message, 404, { code });
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string = "Bad request",
    code: string = "E400_BAD_REQUEST"
  ) {
    super(message, 400, { code });
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    code: string = "E409_CONFLICT"
  ) {
    super(message, 409, { code });
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// Authentication related errors
export class AuthConfigError extends AppError {
  constructor(message: string = "Authentication configuration error") {
    super(message, 500, {
      code: "E500_AUTH_CONFIG",
    });
    Object.setPrototypeOf(this, AuthConfigError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, {
      code: "E401_UNAUTHORIZED",
    });
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, {
      code: "E401_AUTH_FAILED",
    });
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class TokenError extends AppError {
  constructor(
    message: string = "Invalid or expired token",
    code: string = "E401_INVALID_TOKEN"
  ) {
    super(message, 401, { code });
    Object.setPrototypeOf(this, TokenError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, {
      code: "E403_FORBIDDEN",
    });
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
