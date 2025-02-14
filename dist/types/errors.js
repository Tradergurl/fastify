"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.TokenError = exports.AuthenticationError = exports.UnauthorizedError = exports.AuthConfigError = exports.ConflictError = exports.BadRequestError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, options = {}) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = options.code || `E${statusCode}`;
        this.details = options.details;
        this.cause = options.cause;
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = "Validation failed", details) {
        super(message, 400, {
            code: "E400_VALIDATION",
            details,
        });
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found", code = "E404_NOT_FOUND") {
        super(message, 404, { code });
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends AppError {
    constructor(message = "Bad request", code = "E400_BAD_REQUEST") {
        super(message, 400, { code });
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
class ConflictError extends AppError {
    constructor(message = "Resource conflict", code = "E409_CONFLICT") {
        super(message, 409, { code });
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
// Authentication related errors
class AuthConfigError extends AppError {
    constructor(message = "Authentication configuration error") {
        super(message, 500, {
            code: "E500_AUTH_CONFIG",
        });
        Object.setPrototypeOf(this, AuthConfigError.prototype);
    }
}
exports.AuthConfigError = AuthConfigError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized access") {
        super(message, 401, {
            code: "E401_UNAUTHORIZED",
        });
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class AuthenticationError extends AppError {
    constructor(message = "Authentication failed") {
        super(message, 401, {
            code: "E401_AUTH_FAILED",
        });
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
class TokenError extends AppError {
    constructor(message = "Invalid or expired token", code = "E401_INVALID_TOKEN") {
        super(message, 401, { code });
        Object.setPrototypeOf(this, TokenError.prototype);
    }
}
exports.TokenError = TokenError;
class ForbiddenError extends AppError {
    constructor(message = "Access forbidden") {
        super(message, 403, {
            code: "E403_FORBIDDEN",
        });
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
