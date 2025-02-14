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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavorite = toggleFavorite;
exports.getFavoriteRestaurants = getFavoriteRestaurants;
exports.getMultipleFavoriteStatuses = getMultipleFavoriteStatuses;
const favoriteRestaurant_model_1 = require("../models/favoriteRestaurant.model");
const restaurant_model_1 = require("../models/restaurant.model");
// 🔄 Toggle Favorite (Add/Remove)
function toggleFavorite(userId, restaurantId, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisKey = `user:${userId}:favorites`;
        try {
            // MongoDB operation (source of truth)
            const isFavorite = yield favoriteRestaurant_model_1.UserFavoriteModel.exists({
                user: userId,
                restaurants: restaurantId,
            });
            const updateOperation = isFavorite
                ? { $pull: { restaurants: restaurantId } }
                : { $addToSet: { restaurants: restaurantId } };
            yield favoriteRestaurant_model_1.UserFavoriteModel.updateOne({ user: userId }, updateOperation, {
                upsert: true,
            });
            // Update Redis cache (best effort)
            try {
                if (isFavorite) {
                    yield redis.srem(redisKey, restaurantId.toString());
                }
                else {
                    yield redis.sadd(redisKey, restaurantId.toString());
                    // Ensure TTL is set/reset when adding new items
                    yield redis.expire(redisKey, 86400); // 24 hours
                }
            }
            catch (redisError) {
                // Log Redis error but don't fail the operation
                console.error("Redis cache update failed:", redisError);
            }
            return { isFavorite: !isFavorite };
        }
        catch (error) {
            console.error("Toggle favorite failed:", error);
            throw new Error("Failed to update favorite status");
        }
    });
}
// 📌 Get All Favorite Restaurants
function getFavoriteRestaurants(userId, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisKey = `user:${userId}:favorites`;
        console.log("🔍 Checking Redis for favorite restaurants...");
        const restaurantIds = yield redis.smembers(redisKey);
        if (restaurantIds.length > 0) {
            console.log("✅ Found favorite restaurants in Redis:", restaurantIds);
            // ✅ Fetch details from MongoDB (batched query)
            const restaurants = yield restaurant_model_1.RestaurantModel.find({ _id: { $in: restaurantIds } }, { name: 1, address: 1, rating: 1, "images.main_image": 1 }).lean();
            return restaurants;
        }
        console.log("❌ No favorites in Redis, checking MongoDB...");
        // ✅ Fetch from MongoDB if not found in Redis
        const userFavorites = yield favoriteRestaurant_model_1.UserFavoriteModel.findOne({ user: userId }, { restaurants: 1 });
        if (!userFavorites) {
            console.log("❌ No favorites found in MongoDB.");
            return [];
        }
        // ✅ Cache the results in Redis
        if (userFavorites.restaurants.length > 0) {
            yield redis.sadd(redisKey, userFavorites.restaurants.map((id) => id.toString()));
            yield redis.expire(redisKey, 86400); // Cache for 24 hours
        }
        console.log("✅ Cached favorite restaurants in Redis:", userFavorites.restaurants);
        // ✅ Fetch full restaurant details
        const restaurants = yield restaurant_model_1.RestaurantModel.find({ _id: { $in: userFavorites.restaurants } }, { name: 1, address: 1, rating: 1, "images.main_image": 1 }).lean();
        return restaurants;
    });
}
function getMultipleFavoriteStatuses(userId, restaurantIds, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        const favoriteStatuses = new Map();
        // ✅ Initialize all statuses as false
        restaurantIds.forEach((rid) => favoriteStatuses.set(rid.toString(), false));
        const redisKey = `user:${userId}:favorites`;
        // ✅ Get all favorite restaurant IDs from Redis set
        const favoriteRestaurants = yield redis.smembers(redisKey);
        console.log("🔄 Favorite restaurants from Redis:", favoriteRestaurants);
        if (favoriteRestaurants.length > 0) {
            restaurantIds.forEach((rid) => {
                if (favoriteRestaurants.includes(rid.toString())) {
                    favoriteStatuses.set(rid.toString(), true);
                }
            });
        }
        // ✅ Find uncached IDs (not found in Redis set)
        const uncachedIds = restaurantIds.filter((rid) => !favoriteStatuses.get(rid.toString()));
        console.log("🔄 Uncached IDs (not in Redis):", uncachedIds);
        if (uncachedIds.length > 0) {
            // ✅ Fetch from MongoDB only for uncached IDs
            const userFavorites = yield favoriteRestaurant_model_1.UserFavoriteModel.findOne({ user: userId, restaurants: { $in: uncachedIds } }, { restaurants: 1 });
            console.log("🔄 Favorites from MongoDB:", (userFavorites === null || userFavorites === void 0 ? void 0 : userFavorites.restaurants) || []);
            if (userFavorites) {
                userFavorites.restaurants.forEach((rid) => {
                    favoriteStatuses.set(rid.toString(), true);
                });
                // ✅ Cache the new favorite restaurants in Redis set
                if (userFavorites.restaurants.length > 0) {
                    yield redis.sadd(redisKey, userFavorites.restaurants.map((id) => id.toString()));
                    yield redis.expire(redisKey, 86400); // 24 hours
                }
            }
            // ❌ Do NOT create unnecessary keys for non-favorites
        }
        console.log("✅ Final favoriteStatuses:", favoriteStatuses);
        return favoriteStatuses;
    });
}
