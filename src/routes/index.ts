import { FastifyInstance } from "fastify";
import authRoutes from "./auth";
import { Logger } from "pino";
import { restaurantRoutes } from "./restaurant";
import { dekodeTokenRoutes } from "./dekode-token";
import { favoriteRoutes } from "./favorite";
import { redisTest } from "./redisTest";
import { reviewRoutes } from "./review";

interface RouteConfig {
  prefix?: string;
  route: (fastify: FastifyInstance) => Promise<void>;
}

const routes: RouteConfig[] = [
  { route: authRoutes, prefix: "/api/v1/auth" },
  { route: restaurantRoutes, prefix: "/api/v1/restaurant" },
  { route: dekodeTokenRoutes, prefix: "/api/v1/auth/decode-token" },
  { route: favoriteRoutes, prefix: "/api/v1/favorites" },
  //{ route: redisTest, prefix: "/api/v1/redis" },
  { route: reviewRoutes, prefix: "/api/v1" },
];

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  try {
    // Register all routes
    for (const { route, prefix } of routes) {
      if (prefix) {
        await fastify.register(route, { prefix });
      } else {
        await fastify.register(route);
      }
    }

    // Register global routes
    fastify.get("/", async () => ({ hello: "world" }));

    // Health check endpoint
    fastify.get("/health", async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }));

    fastify.log.info("All routes registered successfully");
  } catch (error) {
    fastify.log.error("Error registering routes:", error);
    throw error;
  }
}
