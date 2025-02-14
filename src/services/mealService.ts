import { RestaurantModel } from "../models/restaurant.model";
import { NotFoundError } from "../types/errors";
import { Types } from "mongoose";
import { UpdateMealDTO } from "../interfaces/restaurant.dto";
import { RedisService } from "../config/redis";
import { invalidateRestaurantCache } from "../utils/cacheInvalidation";

export async function addMealToRestaurant(
  restaurantId: Types.ObjectId,
  mealData: any,
  redis: RedisService
) {
  console.log("🔍 Adding meal to restaurant:", restaurantId);
  const restaurant = await RestaurantModel.findById(restaurantId);
  if (!restaurant) throw new NotFoundError("Restaurant not found.");

  const mealWithId = { ...mealData, _id: new Types.ObjectId() };
  restaurant.meals.push(mealWithId);

  await restaurant.save();
  await invalidateRestaurantCache(restaurantId, redis);

  return restaurant;
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
export async function updateMealService(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  mealId: Types.ObjectId,
  updateData: Partial<UpdateMealDTO>,
  redis: RedisService
) {
  // Ensure `updated_at` is always updated

  updateData.updatedAt = new Date();

  // Construct the `$set` update dynamically
  const updateQuery = Object.entries(updateData).reduce(
    (acc, [key, value]) => {
      acc[`meals.$.${key}`] = value;
      return acc;
    },
    {} as Record<string, any>
  );

  // ✅ Ensure required fields are not removed
  updateQuery[`meals.$.type`] = updateQuery[`meals.$.type`] ?? undefined;

  // ✅ Find the meal and update only the specified fields
  const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
    {
      _id: restaurantId,
      owner: ownerId,
      "meals._id": mealId,
    },
    { $set: updateQuery },
    { new: true, runValidators: true } // ✅ Keep validation for safety
  );

  if (!updatedRestaurant) {
    throw new NotFoundError("Meal not found or restaurant ownership mismatch.");
  }

  // ✅ Extract the updated meal
  const updatedMeal = updatedRestaurant.meals.find(
    (meal) => meal._id.toString() === mealId.toString()
  );

  if (!updatedMeal) {
    throw new NotFoundError("Updated meal not found.");
  }
  await invalidateRestaurantCache(restaurantId, redis);

  return updatedMeal;
}

export async function getMealById(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId,
  mealId: Types.ObjectId
) {
  const restaurant = await RestaurantModel.findOne(
    { _id: restaurantId, owner: ownerId, "meals._id": mealId },
    { "meals.$": 1 } // ✅ Only return the matched meal
  );

  if (!restaurant || !restaurant.meals.length) {
    throw new NotFoundError("Meal not found or unauthorized.");
  }

  return restaurant.meals[0]; // ✅ Return only the requested meal
}

export async function getAllMealsByRestaurantId(
  restaurantId: Types.ObjectId,
  ownerId: Types.ObjectId
) {
  const restaurant = await RestaurantModel.findOne(
    { _id: restaurantId, owner: ownerId },
    { meals: 1 } // ✅ Return only meals, not the whole restaurant
  );

  if (!restaurant) {
    throw new NotFoundError("Meals not found or unauthorized.");
  }

  return restaurant.meals; // ✅ Return all meals
}
