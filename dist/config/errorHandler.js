"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../types/errors");
const errorUtils_1 = require("../utils/errorUtils");
const mongoose_1 = __importDefault(require("mongoose"));
// handlers/errorHandler.ts
const errorHandler = (error, request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const log = request.log;
    let response;
    // First check if it's our custom error
    if (error instanceof errors_1.AppError) {
        response = Object.assign({ statusCode: error.statusCode, code: error.code, message: error.message }, (error.details && { details: error.details }));
    }
    else if ("validation" in error &&
        Array.isArray(error.validation)) {
        const details = (0, errorUtils_1.parseValidationErrors)(error.validation);
        response = {
            statusCode: 400,
            code: "E400_VALIDATION",
            message: "Validation failed",
            details,
        };
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        response = {
            statusCode: 400,
            code: "E400_MONGOOSE_VALIDATION",
            message: "Validation failed",
            details: Object.values(error.errors).map((err) => ({
                path: err.path,
                message: err.message,
            })),
        };
    }
    else {
        response = Object.assign({ statusCode: 500, code: "E500_INTERNAL", message: process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error.message }, (process.env.NODE_ENV !== "production" && {
            details: {
                stack: error.stack,
                name: error.name,
            },
        }));
    }
    // Log the final response
    // Make sure we're sending the response correctly
    return reply
        .code(response.statusCode)
        .header("Content-Type", "application/json; charset=utf-8")
        .send(response);
});
exports.errorHandler = errorHandler;
/*
export const errorHandler = async (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const log = request.log as Logger;

  // Debug logging
  console.log("Error type:", error.constructor.name);
  console.log("Error message:", error.message);
  console.log("Is AppError?", error instanceof AppError);
  console.log("Error:", error);

  let response: ErrorResponse;

  // Handle AppError and its subclasses
  if (error instanceof AppError) {
    response = {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  } else if (
    "validation" in error &&
    Array.isArray((error as any).validation)
  ) {
    // Fastify validation errors
    const details = parseValidationErrors((error as any).validation);
    response = {
      statusCode: 400,
      code: "E400_VALIDATION",
      message: "Validation failed",
      details,
    };
  } else if (error instanceof mongoose.Error.ValidationError) {
    // Mongoose validation errors
    response = {
      statusCode: 400,
      code: "E400_MONGOOSE_VALIDATION",
      message: "Validation failed",
      details: Object.values(error.errors).map((err) => ({
        path: err.path,
        message: err.message,
      })),
    };
  } else {
    // Unknown errors - provide more details in development
    console.error("Unhandled error:", error);
    response = {
      statusCode: 500,
      code: "E500_INTERNAL",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message || "Internal server error",
      ...(process.env.NODE_ENV !== "production" && {
        details: {
          stack: error.stack,
          name: error.name,
        },
      }),
    };
  }

  // Log the error
  log.error({
    err: error,
    errorName: error.constructor.name,
    requestId: request.id,
    url: request.url,
    method: request.method,
    response,
  });

  return reply.status(response.statusCode).send(response);
};

/*
export const errorHandler = async (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const log = request.log as Logger;

  // Debug log to see error details
  console.log("Error type:", error.constructor.name);
  console.log("Is AppError?", error instanceof AppError);
  console.log("Error properties:", Object.getOwnPropertyNames(error));

  // Log error with request details
  log.error({
    err: error,
    errorName: error.constructor.name,
    requestId: request.id,
    url: request.url,
    method: request.method,
  });

  let response: ErrorResponse;

  // Check if it's an instance of AppError first
  if (error instanceof AppError) {
    // Handle structured application errors
    response = {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  } else if (
    "validation" in error &&
    Array.isArray((error as any).validation)
  ) {
    // Handle Fastify validation errors
    const details = parseValidationErrors((error as any).validation);
    response = {
      statusCode: 400,
      code: "E400_VALIDATION",
      message: "Validation failed",
      details,
    };
  } else if (error instanceof mongoose.Error.ValidationError) {
    // Handle Mongoose validation errors
    response = {
      statusCode: 400,
      code: "E400_MONGOOSE_VALIDATION",
      message: "Validation failed",
      details: Object.values(error.errors).map((err) => ({
        path: err.path,
        message: err.message,
      })),
    };
  } else if (
    error.name === "MongoServerError" &&
    (error as any).code === 11000
  ) {
    // Handle MongoDB duplicate key errors
    const duplicateKey = Object.keys((error as any).keyValue || {});
    response = {
      statusCode: 409,
      code: "E409_DUPLICATE",
      message: `Duplicate entry for field(s): ${duplicateKey.join(", ")}`,
      details: {
        duplicateKey: (error as any).keyValue,
      },
    };
  } else if (
    "statusCode" in error &&
    typeof (error as any).statusCode === "number"
  ) {
    // Handle Fastify's built-in HTTP errors
    response = {
      statusCode: (error as any).statusCode,
      code: `E${(error as any).statusCode}`,
      message: error.message || "An error occurred",
    };
  } else {
    // Handle unknown errors with more details in development
    console.error("Unhandled error:", error);
    response = {
      statusCode: 500,
      code: "E500_INTERNAL",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : `${error.name}: ${error.message}`,
      ...(process.env.NODE_ENV !== "production" && {
        details: {
          stack: error.stack,
          name: error.name,
        },
      }),
    };
  }

  return reply.status(response.statusCode).send(response);
};

/*
export const errorHandler = async (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const log = request.log as Logger;

  // Log error with request details
  log.error({
    err: error,
    requestId: request.id,
    url: request.url,
    method: request.method,
  });

  let response: ErrorResponse;

  if (error instanceof AppError) {
    // Handle structured application errors
    response = {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    };
  } else if ("validation" in error && Array.isArray(error.validation)) {
    // Handle Fastify validation errors
    const details = parseValidationErrors(error.validation);
    response = {
      statusCode: 400,
      code: "E400_VALIDATION",
      message: "Validation failed",
      details,
    };
  } else if (error instanceof mongoose.Error.ValidationError) {
    // Handle Mongoose validation errors
    response = {
      statusCode: 400,
      code: "E400_MONGOOSE_VALIDATION",
      message: "Validation failed",
      details: Object.values(error.errors).map((err) => ({
        path: err.path,
        message: err.message,
      })),
    };
  } else if (
    error.name === "MongoServerError" &&
    (error as any).code === 11000
  ) {
    // Handle MongoDB duplicate key errors
    const duplicateKey = Object.keys((error as any).keyValue || {});
    response = {
      statusCode: 409,
      code: "E409_DUPLICATE",
      message: `Duplicate entry for field(s): ${duplicateKey.join(", ")}`,
      details: {
        duplicateKey: (error as any).keyValue,
      },
    };
  } else if ("statusCode" in error && typeof error.statusCode === "number") {
    // Handle Fastify’s built-in HTTP errors
    response = {
      statusCode: error.statusCode,
      code: `E${error.statusCode}`,
      message: error.message || "An error occurred",
    };
  } else {
    // Handle unknown errors
    response = {
      statusCode: 500,
      code: "E500_INTERNAL",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message || "Internal server error",
    };
  }

  return reply.status(response.statusCode).send(response);
};
*/
