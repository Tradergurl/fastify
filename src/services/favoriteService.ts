import { Types } from "mongoose";
import { UserFavoriteModel } from "../models/favoriteRestaurant.model";
import { RestaurantModel } from "../models/restaurant.model";
import { NotFoundError } from "../types/errors";
import { RedisService } from "../config/redis";

// 🔄 Toggle Favorite (Add/Remove)
export async function toggleFavorite(
  userId: Types.ObjectId,
  restaurantId: Types.ObjectId,
  redis: RedisService
) {
  const redisKey = `user:${userId}:favorites`;

  try {
    // MongoDB operation (source of truth)
    const isFavorite = await UserFavoriteModel.exists({
      user: userId,
      restaurants: restaurantId,
    });

    const updateOperation = isFavorite
      ? { $pull: { restaurants: restaurantId } }
      : { $addToSet: { restaurants: restaurantId } };

    await UserFavoriteModel.updateOne({ user: userId }, updateOperation, {
      upsert: true,
    });

    // Update Redis cache (best effort)
    try {
      if (isFavorite) {
        await redis.srem(redisKey, restaurantId.toString());
      } else {
        await redis.sadd(redisKey, restaurantId.toString());
        // Ensure TTL is set/reset when adding new items
        await redis.expire(redisKey, 86400); // 24 hours
      }
    } catch (redisError) {
      // Log Redis error but don't fail the operation
      console.error("Redis cache update failed:", redisError);
    }

    return { isFavorite: !isFavorite };
  } catch (error) {
    console.error("Toggle favorite failed:", error);
    throw new Error("Failed to update favorite status");
  }
}

// 📌 Get All Favorite Restaurants
export async function getFavoriteRestaurants(
  userId: Types.ObjectId,
  redis: RedisService
) {
  const redisKey = `user:${userId}:favorites`;

  console.log("🔍 Checking Redis for favorite restaurants...");
  const restaurantIds = await redis.smembers(redisKey);

  if (restaurantIds.length > 0) {
    console.log("✅ Found favorite restaurants in Redis:", restaurantIds);
    // ✅ Fetch details from MongoDB (batched query)
    const restaurants = await RestaurantModel.find(
      { _id: { $in: restaurantIds } },
      { name: 1, address: 1, rating: 1, "images.main_image": 1 }
    ).lean();

    return restaurants;
  }

  console.log("❌ No favorites in Redis, checking MongoDB...");

  // ✅ Fetch from MongoDB if not found in Redis
  const userFavorites = await UserFavoriteModel.findOne(
    { user: userId },
    { restaurants: 1 }
  );

  if (!userFavorites) {
    console.log("❌ No favorites found in MongoDB.");
    return [];
  }

  // ✅ Cache the results in Redis
  if (userFavorites.restaurants.length > 0) {
    await redis.sadd(
      redisKey,
      userFavorites.restaurants.map((id) => id.toString())
    );
    await redis.expire(redisKey, 86400); // Cache for 24 hours
  }

  console.log(
    "✅ Cached favorite restaurants in Redis:",
    userFavorites.restaurants
  );

  // ✅ Fetch full restaurant details
  const restaurants = await RestaurantModel.find(
    { _id: { $in: userFavorites.restaurants } },
    { name: 1, address: 1, rating: 1, "images.main_image": 1 }
  ).lean();

  return restaurants;
}

export async function getMultipleFavoriteStatuses(
  userId: Types.ObjectId,
  restaurantIds: Types.ObjectId[],
  redis: RedisService
) {
  const favoriteStatuses = new Map<string, boolean>();

  // ✅ Initialize all statuses as false
  restaurantIds.forEach((rid) => favoriteStatuses.set(rid.toString(), false));

  const redisKey = `user:${userId}:favorites`;

  // ✅ Get all favorite restaurant IDs from Redis set
  const favoriteRestaurants = await redis.smembers(redisKey);
  console.log("🔄 Favorite restaurants from Redis:", favoriteRestaurants);

  if (favoriteRestaurants.length > 0) {
    restaurantIds.forEach((rid) => {
      if (favoriteRestaurants.includes(rid.toString())) {
        favoriteStatuses.set(rid.toString(), true);
      }
    });
  }

  // ✅ Find uncached IDs (not found in Redis set)
  const uncachedIds = restaurantIds.filter(
    (rid) => !favoriteStatuses.get(rid.toString())
  );

  console.log("🔄 Uncached IDs (not in Redis):", uncachedIds);

  if (uncachedIds.length > 0) {
    // ✅ Fetch from MongoDB only for uncached IDs
    const userFavorites = await UserFavoriteModel.findOne(
      { user: userId, restaurants: { $in: uncachedIds } },
      { restaurants: 1 }
    );

    console.log("🔄 Favorites from MongoDB:", userFavorites?.restaurants || []);

    if (userFavorites) {
      userFavorites.restaurants.forEach((rid) => {
        favoriteStatuses.set(rid.toString(), true);
      });

      // ✅ Cache the new favorite restaurants in Redis set
      if (userFavorites.restaurants.length > 0) {
        await redis.sadd(
          redisKey,
          userFavorites.restaurants.map((id) => id.toString())
        );
        await redis.expire(redisKey, 86400); // 24 hours
      }
    }

    // ❌ Do NOT create unnecessary keys for non-favorites
  }

  console.log("✅ Final favoriteStatuses:", favoriteStatuses);
  return favoriteStatuses;
}
