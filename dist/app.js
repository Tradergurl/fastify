"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const fastify_1 = __importDefault(require("fastify"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const session_1 = __importDefault(require("@fastify/session"));
const compress_1 = __importDefault(require("@fastify/compress"));
const passport_1 = require("./config/passport");
const index_1 = require("./routes/index");
const ajv_1 = require("./config/ajv");
const metrics_1 = require("./config/metrics");
const errorHandler_1 = require("./config/errorHandler");
const redis_1 = require("./config/redis");
dotenv.config();
dotenv.config({ path: path_1.default.resolve(__dirname, "../.env") });
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
        const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
        }
    }
}
function setupLogging() {
    const logDir = path_1.default.join(__dirname, "../logs");
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path_1.default.join(logDir, "app.log");
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
function registerPlugins(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        // Register TypeBox
        fastify.withTypeProvider();
        // Register essential plugins
        yield fastify.register(formbody_1.default);
        yield fastify.register(cookie_1.default);
        if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
            throw new Error("SESSION_SECRET must be at least 32 characters long");
        }
        // Configure session
        yield fastify.register(session_1.default, {
            secret: SESSION_SECRET,
            cookie: {
                secure: isProduction,
                maxAge: 86400,
                httpOnly: true,
                sameSite: "lax",
            },
        });
        // Configure file upload
        yield fastify.register(multipart_1.default, {
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
        fastify.addHook("preValidation", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            if (request.isMultipart()) {
                const body = request.body;
                for (const key in body) {
                    if (body[key] &&
                        typeof body[key] === "object" &&
                        "value" in body[key]) {
                        body[key] = body[key].value;
                    }
                }
            }
        }));
    });
}
function App() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🟢 Initializing Fastify...");
        validateAuthConfig();
        const fastify = (0, fastify_1.default)({
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
        (0, ajv_1.configureAjv)(fastify);
        // Register all plugins
        yield registerPlugins(fastify);
        console.log("✅ Plugins registered");
        // Setup authentication
        yield (0, passport_1.registerPassport)(fastify);
        console.log("✅ Passport registered");
        // Setup Redis
        const redisService = (0, redis_1.createRedisService)(fastify.log);
        fastify.decorate("redis", redisService);
        // Setup routes
        yield (0, index_1.registerRoutes)(fastify);
        console.log("✅ Routes registered");
        fastify.register(compress_1.default, {
            global: true, // Apply compression to all responses
            encodings: ["gzip", "deflate", "br"], // Support Brotli, Gzip, and Deflate
            threshold: 1024, // Only compress responses > 1KB
        });
        console.log("✅ Compress registered");
        // Setup metrics
        (0, metrics_1.setupMetrics)(fastify);
        console.log("✅ Metrics setup");
        fastify.addHook("onError", (request, reply, error) => __awaiter(this, void 0, void 0, function* () {
            request.log.error(error);
        }));
        // Configure error handler
        fastify.setErrorHandler(errorHandler_1.errorHandler);
        console.log("✅ Error handler configured");
        return fastify;
    });
}
exports.default = App;
