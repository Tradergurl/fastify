import Fastify, { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Logger } from "pino";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

import FastifyMultipart from "@fastify/multipart";
import fastifyFormbody from "@fastify/formbody";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import compress from "@fastify/compress";

import { registerPassport } from "./config/passport";
import { registerRoutes } from "./routes/index";
import { configureAjv } from "./config/ajv";
import { setupMetrics } from "./config/metrics";
import { errorHandler } from "./config/errorHandler";
import { connectDatabase } from "./config/database";
import { createRedisService } from "./config/redis";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Configuration constants
const isProduction = process.env.NODE_ENV === "production";
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!isProduction && SESSION_SECRET === "default_secret") {
  console.warn("Warning: Using default session secret in development mode");
}

function validateAuthConfig() {
  const requiredEnvVars = ["JWT_SECRET"];
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }
  }
}

function setupLogging() {
  const logDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "app.log");

  return isProduction
    ? { level: "trace" }
    : {
        level: "trace",
        transport: {
          target: "pino/file",
          options: { destination: logFile },
        },
      };
}

async function registerPlugins(fastify: FastifyInstance) {
  // Register TypeBox
  fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Register essential plugins
  await fastify.register(fastifyFormbody);
  await fastify.register(fastifyCookie);

  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long");
  }

  // Configure session
  await fastify.register(fastifySession, {
    secret: SESSION_SECRET,
    cookie: {
      secure: isProduction,
      maxAge: 86400,
      httpOnly: true,
      sameSite: "lax",
    },
  });

  // Configure file upload
  await fastify.register(FastifyMultipart, {
    limits: {
      fieldNameSize: 1000,
      fieldSize: 1000000,
      fields: 20,
      fileSize: 10 * 1024 * 1024,
      files: 12,
      headerPairs: 2000,
      parts: 2000,
    },
  });

  fastify.addHook("preValidation", async (request, reply) => {
    if (request.isMultipart()) {
      const body = request.body as any;

      for (const key in body) {
        if (
          body[key] &&
          typeof body[key] === "object" &&
          "value" in body[key]
        ) {
          body[key] = body[key].value;
        }
      }
    }
  });
}

async function App(): Promise<FastifyInstance> {
  console.log("🟢 Initializing Fastify...");
  validateAuthConfig();

  const fastify = Fastify({
    logger: setupLogging(),
    trustProxy: isProduction, // Trust proxy headers if in production
    bodyLimit: 1048576, // 1MB body size limit
    connectionTimeout: 30000,
    serializerOpts: {
      serializeError: false, // prevents Fastify from wrapping our errors
    }, // 30 seconds
  });

  // ✅ Middleware to attach account to request
  // ✅ Middleware to authenticate user via Bearer token
  console.log("✅ Fastify instance created");

  // Configure schemas and validation
  configureAjv(fastify);

  // Register all plugins
  await registerPlugins(fastify);

  console.log("✅ Plugins registered");

  // Setup authentication
  await registerPassport(fastify);

  console.log("✅ Passport registered");

  // Setup Redis
  const redisService = createRedisService(fastify.log);
  fastify.decorate("redis", redisService);

  // Setup routes
  await registerRoutes(fastify);
  console.log("✅ Routes registered");

  fastify.register(compress, {
    global: true, // Apply compression to all responses
    encodings: ["gzip", "deflate", "br"], // Support Brotli, Gzip, and Deflate
    threshold: 1024, // Only compress responses > 1KB
  });
  console.log("✅ Compress registered");

  // Setup metrics
  setupMetrics(fastify);

  console.log("✅ Metrics setup");

  fastify.addHook("onError", async (request, reply, error) => {
    request.log.error(error);
  });
  // Configure error handler

  fastify.setErrorHandler(errorHandler);

  console.log("✅ Error handler configured");

  return fastify;
}

export default App;
