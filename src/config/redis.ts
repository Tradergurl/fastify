// config/redis.ts
import Redis, { RedisOptions, Pipeline } from "ioredis";
import { FastifyBaseLogger } from "fastify";
import { AppError } from "../types/errors";

export class RedisError extends AppError {
  constructor(message: string = "Redis operation failed", cause?: Error) {
    super(message, 500, {
      code: "E500_REDIS_ERROR",
      cause,
    });
  }
}

export interface CacheOptions {
  ttl?: number;
  withLog?: boolean;
}

export class RedisService {
  private client: Redis;
  private logger: FastifyBaseLogger;
  private readonly defaultTTL: number = 3600; // 1 hour in seconds

  constructor(logger: FastifyBaseLogger) {
    this.logger = logger;

    const redisOptions: RedisOptions = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,

      // If REDIS_URL is provided, it will override host/port settings
      ...(process.env.REDIS_URL && { url: process.env.REDIS_URL }),

      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn({ times, delay }, "Redis retry attempt");
        return delay;
      },

      reconnectOnError: (err: Error) => {
        this.logger.error(
          { err },
          "Redis connection error, attempting reconnect"
        );
        return true;
      },

      maxRetriesPerRequest: null,
      enableAutoPipelining: true,

      // TLS options if needed
      ...(process.env.REDIS_TLS === "true" && {
        tls: {
          rejectUnauthorized: false,
        },
      }),
    };

    this.client = new Redis(redisOptions);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("error", (err: Error) => {
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

    this.client.on("reconnecting", (delay: number) => {
      this.logger.warn({ delay }, "Redis client reconnecting");
    });
  }

  public async get<T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      const { withLog = true } = options;
      const data = await this.client.get(key);

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
        return JSON.parse(data) as T;
      } catch {
        return data as T; // If it's not JSON, return raw string
      }
    } catch (error) {
      this.logger.error({ error, key }, "Error getting data from Redis");
      throw new RedisError("Failed to get data from cache", error as Error);
    }
  }

  public async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const { ttl = this.defaultTTL, withLog = true } = options;

      // ✅ Convert object to JSON string before saving
      const serializedData =
        typeof data === "string" ? data : JSON.stringify(data);

      await this.client.setex(key, ttl, serializedData);

      if (withLog) {
        this.logger.debug({ key, ttl }, "Cache set");
      }
    } catch (error) {
      this.logger.error({ error, key }, "Error setting data in Redis");
      throw new RedisError("Failed to set data in cache", error as Error);
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug({ key }, "Cache deleted");
    } catch (error) {
      this.logger.error({ error, key }, "Error deleting data from Redis");
      throw new RedisError("Failed to delete data from cache", error as Error);
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(
        { error, key },
        "Error checking key existence in Redis"
      );
      throw new RedisError(
        "Failed to check key existence in cache",
        error as Error
      );
    }
  }

  public async updateTTL(
    key: string,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      await this.client.expire(key, ttl);
      this.logger.debug({ key, ttl }, "Cache TTL updated");
    } catch (error) {
      this.logger.error({ error, key }, "Error updating TTL in Redis");
      throw new RedisError("Failed to update TTL in cache", error as Error);
    }
  }

  public getClient(): Redis {
    return this.client;
  }

  public async quit(): Promise<void> {
    await this.client.quit();
    this.logger.info("Redis client closed");
  }

  public pipeline(): ReturnType<Redis["pipeline"]> {
    return this.client.pipeline();
  }

  public async smembers(key: string): Promise<string[]> {
    try {
      const members = await this.client.smembers(key);
      this.logger.debug({ key, members }, "Fetched members from Redis Set");
      return members;
    } catch (error) {
      this.logger.error(
        { error, key },
        "Error fetching members from Redis Set"
      );
      throw new RedisError(
        "Failed to fetch members from Redis Set",
        error as Error
      );
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
      this.logger.debug({ key, ttl }, "Cache TTL updated");
    } catch (error) {
      this.logger.error({ error, key }, "Error setting TTL in Redis");
      throw new RedisError("Failed to set TTL in Redis", error as Error);
    }
  }

  public async sadd(key: string, value: string | string[]): Promise<void> {
    try {
      const values = Array.isArray(value) ? value : [value]; // Ensure array format
      await this.client.sadd(key, ...values); // Spread array correctly
      this.logger.debug({ key, values }, "Added values to Redis Set");
    } catch (error) {
      this.logger.error({ error, key }, "Error adding to Redis Set");
      throw new RedisError("Failed to add to Redis Set", error as Error);
    }
  }
  public async srem(key: string, value: string | string[]): Promise<void> {
    try {
      const values = Array.isArray(value) ? value : [value]; // Ensure array format
      await this.client.srem(key, ...values); // Spread array correctly
      this.logger.debug({ key, values }, "Removed values from Redis Set");
    } catch (error) {
      this.logger.error({ error, key }, "Error removing from Redis Set");
      throw new RedisError("Failed to remove from Redis Set", error as Error);
    }
  }

  public async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const values = await this.client.mget(keys);
      this.logger.debug({ keys, values }, "Fetched multiple values from Redis");
      return values;
    } catch (error) {
      this.logger.error(
        { error, keys },
        "Error fetching multiple values from Redis"
      );
      throw new RedisError(
        "Failed to fetch multiple values from Redis",
        error as Error
      );
    }
  }
}

// Export a factory function to create the Redis service
export function createRedisService(logger: FastifyBaseLogger): RedisService {
  return new RedisService(logger);
}
