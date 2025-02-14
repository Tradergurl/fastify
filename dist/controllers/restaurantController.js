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
exports.createRestaurantHandler = createRestaurantHandler;
exports.updateRestaurantHandler = updateRestaurantHandler;
exports.softDeleteRestaurantHandler = softDeleteRestaurantHandler;
exports.deleteRestaurantHandler = deleteRestaurantHandler;
exports.getRestaurantBusinessHandler = getRestaurantBusinessHandler;
exports.getRestaurantClientHandler = getRestaurantClientHandler;
exports.getSimplifiedRestaurantsHandler = getSimplifiedRestaurantsHandler;
exports.addMealHandler = addMealHandler;
exports.updateMealHandler = updateMealHandler;
exports.getMealByIdHandler = getMealByIdHandler;
exports.getAllMealsByRestaurantIdHandler = getAllMealsByRestaurantIdHandler;
const mongoose_1 = require("mongoose");
const restaurantService_1 = require("../services/restaurantService");
const mealService_1 = require("../services/mealService");
const errors_1 = require("../types/errors");
const account_model_1 = require("../models/account.model");
function fillMissingOpeningHours(openingHours) {
    const defaultDay = { open: "", close: "", is_closed: true };
    return {
        monday: openingHours.monday || defaultDay,
        tuesday: openingHours.tuesday || defaultDay,
        wednesday: openingHours.wednesday || defaultDay,
        thursday: openingHours.thursday || defaultDay,
        friday: openingHours.friday || defaultDay,
        saturday: openingHours.saturday || defaultDay,
        sunday: openingHours.sunday || defaultDay,
    };
}
// ✅ Create a restaurant
function createRestaurantHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔍 Incoming request body:", request.body);
            console.log("🔑 Checking authenticated user:", request.currentAccount);
            // ✅ Extract current account
            const currentAccount = request.currentAccount;
            if (!currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated");
            }
            // ✅ Fetch role from database since JWT doesn't include it
            const account = yield account_model_1.AccountModel.findOne({ _id: currentAccount._id }, { role: 1 });
            if (!account) {
                throw new errors_1.AuthenticationError("Account not found.");
            }
            if (account.role !== "business") {
                throw new errors_1.ForbiddenError("Only business accounts can create restaurants.");
            }
            console.log("✅ Authenticated Business Account:", currentAccount._id);
            // ✅ Assign owner to the restaurant
            const restaurantData = Object.assign(Object.assign({}, request.body), { opening_hours: fillMissingOpeningHours(request.body.opening_hours || {}), owner: currentAccount._id });
            // ✅ Validate restaurant name & address
            if (!restaurantData.name || !restaurantData.address) {
                throw new errors_1.BadRequestError("Restaurant name and address are required.");
            }
            // ✅ Pass directly to `createRestaurant` (no need to check role again)
            const newRestaurant = yield (0, restaurantService_1.createRestaurant)(restaurantData, request.server.redis);
            return reply.status(201).send({
                message: "Restaurant created successfully.",
                data: newRestaurant,
            });
        }
        catch (error) {
            request.log.error(error, "Restaurant creation failed");
            throw error;
        }
    });
}
// ✅ Update a restaurant
function updateRestaurantHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔍 Update request body:", request.body);
            console.log("🔑 Authenticated user:", request.currentAccount);
            const currentAccount = request.currentAccount;
            if (!currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated");
            }
            const { id: restaurantId } = request.params;
            const restaurant = yield (0, restaurantService_1.updateRestaurant)(new mongoose_1.Types.ObjectId(restaurantId), currentAccount._id, request.body, request.server.redis);
            if (!restaurant) {
                throw new errors_1.NotFoundError("Restaurant not found or not owned by you.");
            }
            return reply.status(200).send({
                message: "Restaurant updated successfully.",
                data: restaurant,
            });
        }
        catch (error) {
            request.log.error(error, "Restaurant update failed");
            throw error;
        }
    });
}
// ✅ Soft delete a restaurant
function softDeleteRestaurantHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔑 Authenticated user:", request.currentAccount);
            const currentAccount = request.currentAccount;
            if (!currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated");
            }
            const { id: restaurantId } = request.params;
            // ✅ Call service instead of repeating logic
            const result = yield (0, restaurantService_1.softDeleteRestaurant)(new mongoose_1.Types.ObjectId(restaurantId), currentAccount._id, request.server.redis);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Restaurant soft delete failed");
            throw error;
        }
    });
}
// ✅ Permanently delete a restaurant
function deleteRestaurantHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔑 Authenticated user:", request.currentAccount);
            const currentAccount = request.currentAccount;
            if (!currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated");
            }
            const { id: restaurantId } = request.params;
            // ✅ Call service instead of repeating logic
            const result = yield (0, restaurantService_1.deleteRestaurant)(new mongoose_1.Types.ObjectId(restaurantId), currentAccount._id, request.server.redis);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Restaurant hard delete failed");
            throw error;
        }
    });
}
function getRestaurantBusinessHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔑 Authenticated user:", request.currentAccount);
            const currentAccount = request.currentAccount;
            if (!currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated");
            }
            const { id: restaurantId } = request.params;
            const redisKey = `restaurant:business:${restaurantId}`;
            const redis = request.server.redis;
            // ✅ Check cache first
            const cachedData = yield redis.get(redisKey);
            if (cachedData) {
                console.log("✅ Restaurant found in cache (Business View)!");
                return reply.status(200).send({
                    message: "Restaurant retrieved from cache.",
                    data: cachedData,
                });
            }
            // ✅ Find restaurant and verify ownership
            const restaurant = yield (0, restaurantService_1.getRestaurantById)(new mongoose_1.Types.ObjectId(restaurantId));
            if (!restaurant) {
                throw new errors_1.NotFoundError("Restaurant not found or not owned by you.");
            }
            // ✅ Store in cache
            yield redis.set(redisKey, JSON.stringify(restaurant), { ttl: 86400 });
            return reply.status(200).send({
                message: "Restaurant retrieved successfully.",
                data: restaurant,
            });
        }
        catch (error) {
            request.log.error(error, "Fetching restaurant failed");
            throw error;
        }
    });
}
// ✅ Get full restaurant details
function getRestaurantClientHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const restaurantId = new mongoose_1.Types.ObjectId(request.params.id);
            const redisKey = `restaurant:client:${restaurantId}`;
            const redis = request.server.redis;
            // ✅ Check cache first
            const cachedData = yield redis.get(redisKey);
            if (cachedData) {
                console.log("✅ Restaurant found in cache (Client View)!");
                return reply.status(200).send({
                    message: "Restaurant retrieved from cache.",
                    data: cachedData, // ✅ Parse cached JSON
                });
            }
            // ✅ Fetch fresh data
            const restaurant = yield (0, restaurantService_1.getRestaurantByIdClient)(restaurantId);
            if (!restaurant) {
                throw new errors_1.NotFoundError("Restaurant not found.");
            }
            // ✅ Store in cache
            yield redis.set(redisKey, JSON.stringify(restaurant), { ttl: 86400 });
            return reply.status(200).send({ data: restaurant });
        }
        catch (error) {
            request.log.error(error, "Fetching restaurant failed");
            throw error;
        }
    });
}
// ✅ Get list of restaurants (simplified)
function getSimplifiedRestaurantsHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = request.query;
            const restaurants = yield (0, restaurantService_1.getSimplifiedRestaurants)(filters);
            return reply.status(200).send(restaurants);
        }
        catch (error) {
            request.log.error(error, "Fetching restaurants failed");
            throw error;
        }
    });
}
function addMealHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔍 Incoming meal request body:", request.body);
            console.log("🔑 Authenticated user:", request.currentAccount);
            console.log("🔑 Restaurant ID:", request.params.id);
            // ✅ Extract current account
            const currentAccount = request.currentAccount;
            if (!currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated");
            }
            const restaurantId = request.params.id;
            console.log("🔑 Restaurant ID 2:", restaurantId);
            // ✅ Assign meal owner
            const mealData = {
                name: request.body.name,
                description: request.body.description,
                image: request.body.image || "",
                price: request.body.price,
                ingredients: request.body.ingredients,
                allergens: request.body.allergens,
                is_vegan: request.body.is_vegan,
                type: request.body.type,
                is_active: request.body.is_active, // ✅ Single status field
            };
            // ✅ Add meal to restaurant
            const updatedRestaurant = yield (0, mealService_1.addMealToRestaurant)(new mongoose_1.Types.ObjectId(restaurantId), mealData, request.server.redis);
            return reply.status(201).send({
                message: "Meal added successfully.",
                data: updatedRestaurant,
            });
        }
        catch (error) {
            request.log.error(error, "Meal creation failed");
            throw error;
        }
    });
}
// ✅ Update a meal
function updateMealHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 Meal update request:", request.body);
            console.log("🔑 Authenticated user:", request.currentAccount);
            if (!request.currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated.");
            }
            const { id: restaurantId, mealId } = request.params;
            console.log("🔑 Restaurant ID:", restaurantId);
            console.log("🔑 Meal ID:", mealId);
            console.log("🔑 Current account:", request.currentAccount._id);
            const updatedMeal = yield (0, mealService_1.updateMealService)(new mongoose_1.Types.ObjectId(restaurantId), request.currentAccount._id, new mongoose_1.Types.ObjectId(mealId), request.body, request.server.redis);
            console.log("🔑 Updated meal:", updatedMeal);
            if (!updatedMeal) {
                throw new errors_1.NotFoundError("Meal not found after update.");
            }
            return reply.status(200).send({
                message: "Meal updated successfully.",
                data: updatedMeal,
            });
        }
        catch (error) {
            request.log.error(error, "Meal update failed");
            throw error;
        }
    });
}
function getMealByIdHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔍 Fetch meal request:", request.params);
            console.log("🔑 Authenticated user:", request.currentAccount);
            if (!request.currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated.");
            }
            const { restaurantId, mealId } = request.params;
            const meal = yield (0, mealService_1.getMealById)(new mongoose_1.Types.ObjectId(restaurantId), request.currentAccount._id, new mongoose_1.Types.ObjectId(mealId));
            return reply.status(200).send({
                message: "Meal fetched successfully.",
                data: meal,
            });
        }
        catch (error) {
            request.log.error(error, "Meal fetch failed");
            throw error;
        }
    });
}
function getAllMealsByRestaurantIdHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔍 Fetch meals request:", request.params);
            console.log("🔑 Authenticated user:", request.currentAccount);
            if (!request.currentAccount) {
                throw new errors_1.AuthenticationError("User not authenticated.");
            }
            const { restaurantId } = request.params;
            const meals = yield (0, mealService_1.getAllMealsByRestaurantId)(new mongoose_1.Types.ObjectId(restaurantId), request.currentAccount._id);
            return reply.status(200).send({
                message: "Meals fetched successfully.",
                data: meals,
            });
        }
        catch (error) {
            request.log.error(error, "Meals fetch failed");
            throw error;
        }
    });
}
