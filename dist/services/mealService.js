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
exports.addMealToRestaurant = addMealToRestaurant;
exports.updateMealService = updateMealService;
exports.getMealById = getMealById;
exports.getAllMealsByRestaurantId = getAllMealsByRestaurantId;
const restaurant_model_1 = require("../models/restaurant.model");
const errors_1 = require("../types/errors");
const mongoose_1 = require("mongoose");
const cacheInvalidation_1 = require("../utils/cacheInvalidation");
function addMealToRestaurant(restaurantId, mealData, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🔍 Adding meal to restaurant:", restaurantId);
        const restaurant = yield restaurant_model_1.RestaurantModel.findById(restaurantId);
        if (!restaurant)
            throw new errors_1.NotFoundError("Restaurant not found.");
        const mealWithId = Object.assign(Object.assign({}, mealData), { _id: new mongoose_1.Types.ObjectId() });
        restaurant.meals.push(mealWithId);
        yield restaurant.save();
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(restaurantId, redis);
        return restaurant;
    });
}
/*
export async function updateMealService(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  mealId: Types.ObjectId,
  updateData: Partial<UpdateMealDTO>
) {
  // ✅ Find restaurant and verify ownership
  const restaurant = await RestaurantModel.findOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found or not owned by user.");
  }

  // ✅ Find the meal inside embedded meals array and update it
  const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
    { _id: restaurantId, "meals._id": mealId },
    { $set: { "meals.$": { ...updateData, updated_at: new Date() } } },
    { new: true }
  );

  if (!updatedRestaurant) {
    throw new NotFoundError("Meal not found.");
  }

  return updatedRestaurant;
}
  */
/*
export async function updateMealService(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  mealId: Types.ObjectId,
  updateData: Partial<UpdateMealDTO>
) {
  // ✅ Find the restaurant and ensure ownership
  const restaurant = await RestaurantModel.findOne({
    _id: restaurantId,
    owner: ownerId,
  });

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found or not owned by user.");
  }

  // ✅ Find the specific meal and update only changed fields
  const meal = restaurant.meals.find(
    (m) => m._id.toString() === mealId.toString()
  );

  if (!meal) {
    throw new NotFoundError("Meal not found.");
  }

  Object.assign(meal, updateData, { updated_at: new Date() }); // ✅ Merge fields without changing _id

  await restaurant.save(); // ✅ Save changes

  return meal;
}
  */
function updateMealService(restaurantId, ownerId, mealId, updateData, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure `updated_at` is always updated
        var _a;
        updateData.updatedAt = new Date();
        // Construct the `$set` update dynamically
        const updateQuery = Object.entries(updateData).reduce((acc, [key, value]) => {
            acc[`meals.$.${key}`] = value;
            return acc;
        }, {});
        // ✅ Ensure required fields are not removed
        updateQuery[`meals.$.type`] = (_a = updateQuery[`meals.$.type`]) !== null && _a !== void 0 ? _a : undefined;
        // ✅ Find the meal and update only the specified fields
        const updatedRestaurant = yield restaurant_model_1.RestaurantModel.findOneAndUpdate({
            _id: restaurantId,
            owner: ownerId,
            "meals._id": mealId,
        }, { $set: updateQuery }, { new: true, runValidators: true } // ✅ Keep validation for safety
        );
        if (!updatedRestaurant) {
            throw new errors_1.NotFoundError("Meal not found or restaurant ownership mismatch.");
        }
        // ✅ Extract the updated meal
        const updatedMeal = updatedRestaurant.meals.find((meal) => meal._id.toString() === mealId.toString());
        if (!updatedMeal) {
            throw new errors_1.NotFoundError("Updated meal not found.");
        }
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(restaurantId, redis);
        return updatedMeal;
    });
}
function getMealById(restaurantId, ownerId, mealId) {
    return __awaiter(this, void 0, void 0, function* () {
        const restaurant = yield restaurant_model_1.RestaurantModel.findOne({ _id: restaurantId, owner: ownerId, "meals._id": mealId }, { "meals.$": 1 } // ✅ Only return the matched meal
        );
        if (!restaurant || !restaurant.meals.length) {
            throw new errors_1.NotFoundError("Meal not found or unauthorized.");
        }
        return restaurant.meals[0]; // ✅ Return only the requested meal
    });
}
function getAllMealsByRestaurantId(restaurantId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const restaurant = yield restaurant_model_1.RestaurantModel.findOne({ _id: restaurantId, owner: ownerId }, { meals: 1 } // ✅ Return only meals, not the whole restaurant
        );
        if (!restaurant) {
            throw new errors_1.NotFoundError("Meals not found or unauthorized.");
        }
        return restaurant.meals; // ✅ Return all meals
    });
}
