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
exports.createRestaurant = createRestaurant;
exports.updateRestaurant = updateRestaurant;
exports.softDeleteRestaurant = softDeleteRestaurant;
exports.deleteRestaurant = deleteRestaurant;
exports.getRestaurantById = getRestaurantById;
exports.getRestaurantByIdClient = getRestaurantByIdClient;
exports.getSimplifiedRestaurants = getSimplifiedRestaurants;
const restaurant_model_1 = require("../models/restaurant.model");
const errors_1 = require("../types/errors");
const cacheInvalidation_1 = require("../utils/cacheInvalidation");
// ✅ Create a new restaurant
function createRestaurant(restaurantData, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 Creating new restaurant:", restaurantData);
        try {
            const newRestaurant = yield restaurant_model_1.RestaurantModel.create(restaurantData);
            console.log("✅ Restaurant created:", newRestaurant);
            const redisKey = `restaurant:${newRestaurant._id}`;
            yield redis.set(redisKey, newRestaurant, { ttl: 86400 });
            console.log("✅ Restaurant cached in Redis");
            return newRestaurant;
        }
        catch (error) {
            console.error("❌ Error creating restaurant:", error);
            throw error;
        }
    });
}
function updateRestaurant(restaurantId, ownerId, updateData, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        const restaurant = yield restaurant_model_1.RestaurantModel.findOneAndUpdate({ _id: restaurantId, owner: ownerId }, [
            {
                $set: Object.assign({}, Object.entries(updateData).reduce((acc, [key, value]) => {
                    if (typeof value === "object" &&
                        !Array.isArray(value) &&
                        value !== null) {
                        acc[key] = { $mergeObjects: [`$${key}`, value] }; // ✅ Merge instead of replace
                    }
                    else {
                        acc[key] = value;
                    }
                    return acc;
                }, {})),
            },
        ], { new: true, runValidators: true, context: "query" });
        if (!restaurant) {
            throw new errors_1.NotFoundError("Restaurant not found or not owned by user.");
        }
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(restaurantId, redis);
        return restaurant;
    });
}
// ✅ Soft delete (set is_active to false)
function softDeleteRestaurant(restaurantId, ownerId, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield restaurant_model_1.RestaurantModel.updateOne({ _id: restaurantId, owner: ownerId, is_deleted: false }, { $set: { is_deleted: true, "status.is_active": false } });
        if (result.modifiedCount === 0) {
            throw new errors_1.NotFoundError("Restaurant not found or already deleted.");
        }
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(restaurantId, redis);
        return { message: "Restaurant deactivated successfully" };
    });
}
// ✅ Permanently delete a restaurant
function deleteRestaurant(restaurantId, ownerId, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield restaurant_model_1.RestaurantModel.deleteOne({
            _id: restaurantId,
            owner: ownerId,
        });
        if (result.deletedCount === 0) {
            throw new errors_1.NotFoundError("Restaurant not found or not owned by user.");
        }
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(restaurantId, redis);
        return { message: "Restaurant permanently deleted" };
    });
}
// ✅ Get full restaurant data
function getRestaurantById(restaurantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const restaurant = yield restaurant_model_1.RestaurantModel.findOne({
            _id: restaurantId,
            is_deleted: false,
        }).populate("owner", "first_name last_name email"); // ✅ Fetch owner details
        if (!restaurant) {
            throw new errors_1.NotFoundError("Restaurant not found.");
        }
        return restaurant;
    });
}
function getRestaurantByIdClient(restaurantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const restaurant = yield restaurant_model_1.RestaurantModel.findById(restaurantId, {
            name: 1,
            address: 1,
            meals: 1, // ✅ Fetch all meals (already stored in document)
            recent_reviews: 1, // ✅ Fetch last 5 reviews (already stored)
            rating: 1,
        });
        if (!restaurant)
            throw new errors_1.NotFoundError("Restaurant not found.");
        return restaurant;
    });
}
function getSimplifiedRestaurants(_a) {
    return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, city, restaurant_type, cuisine_type, sortBy, }) {
        const filter = { is_deleted: false, "status.is_active": true };
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
        const sortOptions = {};
        if (sortBy === "top_rated") {
            sortOptions["rating.average"] = -1; // Highest rated first
        }
        else if (sortBy === "most_popular") {
            sortOptions["rating.count"] = -1; // Most reviews first
        }
        else if (sortBy === "recommended") {
            sortOptions["status.is_verified"] = -1; // Verified restaurants first
            sortOptions["rating.average"] = { $exists: true, $gt: 0 }; // Then sort by rating
        }
        // Pagination
        const skip = (page - 1) * limit;
        // Fetch restaurants with filters, sorting, and pagination
        const restaurantsPromise = restaurant_model_1.RestaurantModel.find(filter, {
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
        const totalItemsPromise = page === 1 ? restaurant_model_1.RestaurantModel.countDocuments(filter) : Promise.resolve(null);
        const [restaurants, totalItems] = yield Promise.all([
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
    });
}
