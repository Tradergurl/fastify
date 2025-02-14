import { skipMiddlewareFunction, Types } from "mongoose";
import {
  RestaurantModel,
  RestaurantDocument,
} from "../models/restaurant.model";
import { AccountModel } from "../models/account.model";
import { NotFoundError, ForbiddenError } from "../types/errors";
import { UpdateRestaurantDTO } from "../interfaces/restaurant.dto";
import { RedisService } from "../config/redis";
import { invalidateRestaurantCache } from "../utils/cacheInvalidation";
// ✅ Create a new restaurant
export async function createRestaurant(
  restaurantData: any,
  redis: RedisService
) {
  console.log("🚀 Creating new restaurant:", restaurantData);

  try {
    const newRestaurant = await RestaurantModel.create(restaurantData);
    console.log("✅ Restaurant created:", newRestaurant);
    const redisKey = `restaurant:${newRestaurant._id}`;
    await redis.set(redisKey, newRestaurant, { ttl: 86400 });
    console.log("✅ Restaurant cached in Redis");
    return newRestaurant;
  } catch (error) {
    console.error("❌ Error creating restaurant:", error);
    throw error;
  }
}

export async function updateRestaurant(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  updateData: UpdateRestaurantDTO,
  redis: RedisService
) {
  const restaurant = await RestaurantModel.findOneAndUpdate(
    { _id: restaurantId, owner: ownerId },
    [
      {
        $set: {
          ...Object.entries(updateData).reduce((acc, [key, value]) => {
            if (
              typeof value === "object" &&
              !Array.isArray(value) &&
              value !== null
            ) {
              acc[key] = { $mergeObjects: [`$${key}`, value] }; // ✅ Merge instead of replace
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as any),
        },
      },
    ],
    { new: true, runValidators: true, context: "query" }
  );

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found or not owned by user.");
  }
  await invalidateRestaurantCache(restaurantId, redis);
  return restaurant;
}

// ✅ Soft delete (set is_active to false)
export async function softDeleteRestaurant(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  redis: RedisService
) {
  const result = await RestaurantModel.updateOne(
    { _id: restaurantId, owner: ownerId, is_deleted: false },
    { $set: { is_deleted: true, "status.is_active": false } }
  );

  if (result.modifiedCount === 0) {
    throw new NotFoundError("Restaurant not found or already deleted.");
  }
  await invalidateRestaurantCache(restaurantId, redis);
  return { message: "Restaurant deactivated successfully" };
}

// ✅ Permanently delete a restaurant
export async function deleteRestaurant(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  redis: RedisService
) {
  const result = await RestaurantModel.deleteOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (result.deletedCount === 0) {
    throw new NotFoundError("Restaurant not found or not owned by user.");
  }
  await invalidateRestaurantCache(restaurantId, redis);

  return { message: "Restaurant permanently deleted" };
}

// ✅ Get full restaurant data
export async function getRestaurantById(restaurantId: Types.ObjectId) {
  const restaurant = await RestaurantModel.findOne({
    _id: restaurantId,
    is_deleted: false,
  }).populate("owner", "first_name last_name email"); // ✅ Fetch owner details

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found.");
  }

  return restaurant;
}

export async function getRestaurantByIdClient(restaurantId: Types.ObjectId) {
  const restaurant = await RestaurantModel.findById(restaurantId, {
    name: 1,
    address: 1,
    meals: 1, // ✅ Fetch all meals (already stored in document)
    recent_reviews: 1, // ✅ Fetch last 5 reviews (already stored)
    rating: 1,
  });

  if (!restaurant) throw new NotFoundError("Restaurant not found.");
  return restaurant;
}

export async function getSimplifiedRestaurants({
  page = 1,
  limit = 10,
  city,
  restaurant_type,
  cuisine_type,
  sortBy,
}: {
  page?: number;
  limit?: number;
  city?: string;
  restaurant_type?: string;
  cuisine_type?: string;
  sortBy?: "top_rated" | "recommended" | "most_popular";
}) {
  const filter: any = { is_deleted: false, "status.is_active": true };

  // Apply filters
  if (city) {
    filter["address.formatted_address"] = { $regex: city, $options: "i" }; // Case-insensitive search
  }
  if (restaurant_type) {
    filter.restaurant_types = restaurant_type;
  }
  if (cuisine_type) {
    filter.cuisine_types = cuisine_type;
  }

  // Sorting options
  const sortOptions: any = {};
  if (sortBy === "top_rated") {
    sortOptions["rating.average"] = -1; // Highest rated first
  } else if (sortBy === "most_popular") {
    sortOptions["rating.count"] = -1; // Most reviews first
  } else if (sortBy === "recommended") {
    sortOptions["status.is_verified"] = -1; // Verified restaurants first
    sortOptions["rating.average"] = { $exists: true, $gt: 0 }; // Then sort by rating
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Fetch restaurants with filters, sorting, and pagination
  const restaurantsPromise = RestaurantModel.find(filter, {
    name: 1,
    "address.formatted_address": 1,
    "rating.average": 1,
    "rating.count": 1,
    restaurant_types: 1,
    cuisine_types: 1,
    "images.main_image": 1,
  })
    .lean()
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination metadata
  const totalItemsPromise =
    page === 1 ? RestaurantModel.countDocuments(filter) : Promise.resolve(null);

  const [restaurants, totalItems] = await Promise.all([
    restaurantsPromise,
    totalItemsPromise,
  ]);

  return {
    data: restaurants,
    pagination: {
      totalItems: totalItems || undefined,
      itemsPerPage: limit,
      totalPages: totalItems ? Math.ceil(totalItems / limit) : undefined,
      currentPage: page,
    },
  };
}
