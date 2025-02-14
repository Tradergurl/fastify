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
exports.RedisService = exports.RedisError = void 0;
exports.createRedisService = createRedisService;
// config/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const errors_1 = require("../types/errors");
class RedisError extends errors_1.AppError {
    constructor(message = "Redis operation failed", cause) {
        super(message, 500, {
            code: "E500_REDIS_ERROR",
            cause,
        });
    }
}
exports.RedisError = RedisError;
class RedisService {
    constructor(logger) {
        this.defaultTTL = 3600; // 1 hour in seconds
        this.logger = logger;
        const redisOptions = Object.assign(Object.assign(Object.assign({ host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT || "6379", 10), username: process.env.REDIS_USER, password: process.env.REDIS_PASSWORD }, (process.env.REDIS_URL && { url: process.env.REDIS_URL })), { retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                this.logger.warn({ times, delay }, "Redis retry attempt");
                return delay;
            }, reconnectOnError: (err) => {
                this.logger.error({ err }, "Redis connection error, attempting reconnect");
                return true;
            }, maxRetriesPerRequest: null, enableAutoPipelining: true }), (process.env.REDIS_TLS === "true" && {
            tls: {
                rejectUnauthorized: false,
            },
        }));
        this.client = new ioredis_1.default(redisOptions);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.client.on("error", (err) => {
            this.logger.error({ err }, "Redis client error");
        });
        this.client.on("connect", () => {
            this.logger.info("Redis client connected");
        });
        this.client.on("ready", () => {
            this.logger.info("Redis client ready");
        });
        this.client.on("close", () => {
            this.logger.warn("Redis client disconnected");
        });
        this.client.on("reconnecting", (delay) => {
            this.logger.warn({ delay }, "Redis client reconnecting");
        });
    }
    get(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, options = {}) {
            try {
                const { withLog = true } = options;
                const data = yield this.client.get(key);
                if (!data) {
                    if (withLog) {
                        this.logger.debug({ key }, "Cache miss");
                    }
                    return null;
                }
                if (withLog) {
                    this.logger.debug({ key }, "Cache hit");
                }
                try {
                    // ✅ Parse JSON only if data is a valid JSON string
                    return JSON.parse(data);
                }
                catch (_a) {
                    return data; // If it's not JSON, return raw string
                }
            }
            catch (error) {
                this.logger.error({ error, key }, "Error getting data from Redis");
                throw new RedisError("Failed to get data from cache", error);
            }
        });
    }
    set(key_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (key, data, options = {}) {
            try {
                const { ttl = this.defaultTTL, withLog = true } = options;
                // ✅ Convert object to JSON string before saving
                const serializedData = typeof data === "string" ? data : JSON.stringify(data);
                yield this.client.setex(key, ttl, serializedData);
                if (withLog) {
                    this.logger.debug({ key, ttl }, "Cache set");
                }
            }
            catch (error) {
                this.logger.error({ error, key }, "Error setting data in Redis");
                throw new RedisError("Failed to set data in cache", error);
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(key);
                this.logger.debug({ key }, "Cache deleted");
            }
            catch (error) {
                this.logger.error({ error, key }, "Error deleting data from Redis");
                throw new RedisError("Failed to delete data from cache", error);
            }
        });
    }
    exists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.client.exists(key);
                return exists === 1;
            }
            catch (error) {
                this.logger.error({ error, key }, "Error checking key existence in Redis");
                throw new RedisError("Failed to check key existence in cache", error);
            }
        });
    }
    updateTTL(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, ttl = this.defaultTTL) {
            try {
                yield this.client.expire(key, ttl);
                this.logger.debug({ key, ttl }, "Cache TTL updated");
            }
            catch (error) {
                this.logger.error({ error, key }, "Error updating TTL in Redis");
                throw new RedisError("Failed to update TTL in cache", error);
            }
        });
    }
    getClient() {
        return this.client;
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.quit();
            this.logger.info("Redis client closed");
        });
    }
    pipeline() {
        return this.client.pipeline();
    }
    smembers(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const members = yield this.client.smembers(key);
                this.logger.debug({ key, members }, "Fetched members from Redis Set");
                return members;
            }
            catch (error) {
                this.logger.error({ error, key }, "Error fetching members from Redis Set");
                throw new RedisError("Failed to fetch members from Redis Set", error);
            }
        });
    }
    expire(key, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.expire(key, ttl);
                this.logger.debug({ key, ttl }, "Cache TTL updated");
            }
            catch (error) {
                this.logger.error({ error, key }, "Error setting TTL in Redis");
                throw new RedisError("Failed to set TTL in Redis", error);
            }
        });
    }
    sadd(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const values = Array.isArray(value) ? value : [value]; // Ensure array format
                yield this.client.sadd(key, ...values); // Spread array correctly
                this.logger.debug({ key, values }, "Added values to Redis Set");
            }
            catch (error) {
                this.logger.error({ error, key }, "Error adding to Redis Set");
                throw new RedisError("Failed to add to Redis Set", error);
            }
        });
    }
    srem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const values = Array.isArray(value) ? value : [value]; // Ensure array format
                yield this.client.srem(key, ...values); // Spread array correctly
                this.logger.debug({ key, values }, "Removed values from Redis Set");
            }
            catch (error) {
                this.logger.error({ error, key }, "Error removing from Redis Set");
                throw new RedisError("Failed to remove from Redis Set", error);
            }
        });
    }
    mget(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const values = yield this.client.mget(keys);
                this.logger.debug({ keys, values }, "Fetched multiple values from Redis");
                return values;
            }
            catch (error) {
                this.logger.error({ error, keys }, "Error fetching multiple values from Redis");
                throw new RedisError("Failed to fetch multiple values from Redis", error);
            }
        });
    }
}
exports.RedisService = RedisService;
// Export a factory function to create the Redis service
function createRedisService(logger) {
    return new RedisService(logger);
}
