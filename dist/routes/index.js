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
exports.registerRoutes = registerRoutes;
const auth_1 = __importDefault(require("./auth"));
const restaurant_1 = require("./restaurant");
const dekode_token_1 = require("./dekode-token");
const favorite_1 = require("./favorite");
const review_1 = require("./review");
const routes = [
    { route: auth_1.default, prefix: "/api/v1/auth" },
    { route: restaurant_1.restaurantRoutes, prefix: "/api/v1/restaurant" },
    { route: dekode_token_1.dekodeTokenRoutes, prefix: "/api/v1/auth/decode-token" },
    { route: favorite_1.favoriteRoutes, prefix: "/api/v1/favorites" },
    //{ route: redisTest, prefix: "/api/v1/redis" },
    { route: review_1.reviewRoutes, prefix: "/api/v1" },
];
function registerRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Register all routes
            for (const { route, prefix } of routes) {
                if (prefix) {
                    yield fastify.register(route, { prefix });
                }
                else {
                    yield fastify.register(route);
                }
            }
            // Register global routes
            fastify.get("/", () => __awaiter(this, void 0, void 0, function* () { return ({ hello: "world" }); }));
            // Health check endpoint
            fastify.get("/health", () => __awaiter(this, void 0, void 0, function* () {
                return ({
                    status: "ok",
                    timestamp: new Date().toISOString(),
                });
            }));
            fastify.log.info("All routes registered successfully");
        }
        catch (error) {
            fastify.log.error("Error registering routes:", error);
            throw error;
        }
    });
}
