import { FastifyRequest, FastifyReply } from "fastify";
import { Types, ObjectId } from "mongoose";
import {
  createRestaurant,
  updateRestaurant,
  softDeleteRestaurant,
  deleteRestaurant,
  getRestaurantByIdClient,
  getRestaurantById,
  getSimplifiedRestaurants,
} from "../services/restaurantService";
import {
  addMealToRestaurant,
  updateMealService,
  getMealById,
  getAllMealsByRestaurantId,
} from "../services/mealService";
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../types/errors";
import {
  CreateRestaurantDTO,
  UpdateRestaurantDTO,
  GetRestaurantsQuery,
  CreateMealDTO,
  UpdateMealDTO,
  Meal,
} from "../interfaces/restaurant.dto";
import { AccountModel } from "../models/account.model";
import {
  RestaurantModel,
  RestaurantDocument,
} from "../models/restaurant.model";
import zlib from "zlib";
import { OpeningHoursDTO } from "../interfaces/restaurant.dto";
import { RedisService } from "../config/redis";
function fillMissingOpeningHours(
  openingHours: Partial<OpeningHoursDTO>
): OpeningHoursDTO {
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

export async function createRestaurantHandler(
  request: FastifyRequest<{ Body: CreateRestaurantDTO }>,
  reply: FastifyReply
) {
  try {
    console.log("🔍 Incoming request body:", request.body);
    console.log("🔑 Checking authenticated user:", request.currentAccount);

    // ✅ Extract current account
    const currentAccount = request.currentAccount;

    if (!currentAccount) {
      throw new AuthenticationError("User not authenticated");
    }

    // ✅ Fetch role from database since JWT doesn't include it
    const account = await AccountModel.findOne(
      { _id: currentAccount._id },
      { role: 1 }
    );

    if (!account) {
      throw new AuthenticationError("Account not found.");
    }

    if (account.role !== "business") {
      throw new ForbiddenError(
        "Only business accounts can create restaurants."
      );
    }

    console.log("✅ Authenticated Business Account:", currentAccount._id);

    // ✅ Assign owner to the restaurant
    const restaurantData = {
      ...request.body,
      opening_hours: fillMissingOpeningHours(request.body.opening_hours || {}),
      owner: currentAccount._id, // Set business account as owner
    };

    // ✅ Validate restaurant name & address
    if (!restaurantData.name || !restaurantData.address) {
      throw new BadRequestError("Restaurant name and address are required.");
    }

    // ✅ Pass directly to `createRestaurant` (no need to check role again)
    const newRestaurant = await createRestaurant(
      restaurantData,
      request.server.redis
    );

    return reply.status(201).send({
      message: "Restaurant created successfully.",
      data: newRestaurant,
    });
  } catch (error) {
    request.log.error(error, "Restaurant creation failed");
    throw error;
  }
}

// ✅ Update a restaurant
export async function updateRestaurantHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateRestaurantDTO;
  }>,

  reply: FastifyReply
) {
  try {
    console.log("🔍 Update request body:", request.body);
    console.log("🔑 Authenticated user:", request.currentAccount);

    const currentAccount = request.currentAccount;
    if (!currentAccount) {
      throw new AuthenticationError("User not authenticated");
    }

    const { id: restaurantId } = request.params;

    const restaurant = await updateRestaurant(
      new Types.ObjectId(restaurantId),
      currentAccount._id,
      request.body,
      request.server.redis
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found or not owned by you.");
    }

    return reply.status(200).send({
      message: "Restaurant updated successfully.",
      data: restaurant,
    });
  } catch (error) {
    request.log.error(error, "Restaurant update failed");
    throw error;
  }
}

// ✅ Soft delete a restaurant
export async function softDeleteRestaurantHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    console.log("🔑 Authenticated user:", request.currentAccount);

    const currentAccount = request.currentAccount;
    if (!currentAccount) {
      throw new AuthenticationError("User not authenticated");
    }

    const { id: restaurantId } = request.params;

    // ✅ Call service instead of repeating logic
    const result = await softDeleteRestaurant(
      new Types.ObjectId(restaurantId),
      currentAccount._id,
      request.server.redis
    );

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Restaurant soft delete failed");
    throw error;
  }
}

// ✅ Permanently delete a restaurant
export async function deleteRestaurantHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    console.log("🔑 Authenticated user:", request.currentAccount);

    const currentAccount = request.currentAccount;
    if (!currentAccount) {
      throw new AuthenticationError("User not authenticated");
    }

    const { id: restaurantId } = request.params;

    // ✅ Call service instead of repeating logic
    const result = await deleteRestaurant(
      new Types.ObjectId(restaurantId),
      currentAccount._id,
      request.server.redis
    );

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Restaurant hard delete failed");
    throw error;
  }
}

export async function getRestaurantBusinessHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    console.log("🔑 Authenticated user:", request.currentAccount);

    const currentAccount = request.currentAccount;
    if (!currentAccount) {
      throw new AuthenticationError("User not authenticated");
    }

    const { id: restaurantId } = request.params;
    const redisKey = `restaurant:business:${restaurantId}`;
    const redis = request.server.redis as RedisService;

    // ✅ Check cache first
    const cachedData = await redis.get(redisKey);
    if (cachedData) {
      console.log("✅ Restaurant found in cache (Business View)!");
      return reply.status(200).send({
        message: "Restaurant retrieved from cache.",
        data: cachedData,
      });
    }

    // ✅ Find restaurant and verify ownership
    const restaurant = await getRestaurantById(
      new Types.ObjectId(restaurantId)
    );
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found or not owned by you.");
    }

    // ✅ Store in cache
    await redis.set(redisKey, JSON.stringify(restaurant), { ttl: 86400 });

    return reply.status(200).send({
      message: "Restaurant retrieved successfully.",
      data: restaurant,
    });
  } catch (error) {
    request.log.error(error, "Fetching restaurant failed");
    throw error;
  }
}

// ✅ Get full restaurant details
export async function getRestaurantClientHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const restaurantId = new Types.ObjectId(request.params.id);
    const redisKey = `restaurant:client:${restaurantId}`;
    const redis = request.server.redis as RedisService;

    // ✅ Check cache first
    const cachedData = await redis.get(redisKey);
    if (cachedData) {
      console.log("✅ Restaurant found in cache (Client View)!");
      return reply.status(200).send({
        message: "Restaurant retrieved from cache.",
        data: cachedData, // ✅ Parse cached JSON
      });
    }

    // ✅ Fetch fresh data
    const restaurant = await getRestaurantByIdClient(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found.");
    }

    // ✅ Store in cache
    await redis.set(redisKey, JSON.stringify(restaurant), { ttl: 86400 });

    return reply.status(200).send({ data: restaurant });
  } catch (error) {
    request.log.error(error, "Fetching restaurant failed");
    throw error;
  }
}

// ✅ Get list of restaurants (simplified)
export async function getSimplifiedRestaurantsHandler(
  request: FastifyRequest<{ Querystring: GetRestaurantsQuery }>,
  reply: FastifyReply
) {
  try {
    const filters = request.query;
    const restaurants = await getSimplifiedRestaurants(filters);

    return reply.status(200).send(restaurants);
  } catch (error) {
    request.log.error(error, "Fetching restaurants failed");
    throw error;
  }
}

export async function addMealHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: CreateMealDTO }>,
  reply: FastifyReply
) {
  try {
    console.log("🔍 Incoming meal request body:", request.body);
    console.log("🔑 Authenticated user:", request.currentAccount);
    console.log("🔑 Restaurant ID:", request.params.id);

    // ✅ Extract current account
    const currentAccount = request.currentAccount;
    if (!currentAccount) {
      throw new AuthenticationError("User not authenticated");
    }

    const restaurantId = request.params.id;
    console.log("🔑 Restaurant ID 2:", restaurantId);

    // ✅ Assign meal owner
    const mealData: CreateMealDTO = {
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
    const updatedRestaurant = await addMealToRestaurant(
      new Types.ObjectId(restaurantId),
      mealData,
      request.server.redis
    );

    return reply.status(201).send({
      message: "Meal added successfully.",
      data: updatedRestaurant,
    });
  } catch (error) {
    request.log.error(error, "Meal creation failed");
    throw error;
  }
}

// ✅ Update a meal
export async function updateMealHandler(
  request: FastifyRequest<{
    Params: { id: string; mealId: string };
    Body: Partial<UpdateMealDTO>;
  }>,
  reply: FastifyReply
) {
  try {
    console.log("🔄 Meal update request:", request.body);
    console.log("🔑 Authenticated user:", request.currentAccount);

    if (!request.currentAccount) {
      throw new AuthenticationError("User not authenticated.");
    }

    const { id: restaurantId, mealId } = request.params;
    console.log("🔑 Restaurant ID:", restaurantId);
    console.log("🔑 Meal ID:", mealId);

    console.log("🔑 Current account:", request.currentAccount._id);

    const updatedMeal = await updateMealService(
      new Types.ObjectId(restaurantId),
      request.currentAccount._id,
      new Types.ObjectId(mealId),
      request.body,
      request.server.redis
    );
    console.log("🔑 Updated meal:", updatedMeal);

    if (!updatedMeal) {
      throw new NotFoundError("Meal not found after update.");
    }

    return reply.status(200).send({
      message: "Meal updated successfully.",
      data: updatedMeal,
    });
  } catch (error) {
    request.log.error(error, "Meal update failed");
    throw error;
  }
}

export async function getMealByIdHandler(
  request: FastifyRequest<{
    Params: { restaurantId: string; mealId: string };
  }>,
  reply: FastifyReply
) {
  try {
    console.log("🔍 Fetch meal request:", request.params);
    console.log("🔑 Authenticated user:", request.currentAccount);

    if (!request.currentAccount) {
      throw new AuthenticationError("User not authenticated.");
    }

    const { restaurantId, mealId } = request.params;

    const meal = await getMealById(
      new Types.ObjectId(restaurantId),
      request.currentAccount._id,
      new Types.ObjectId(mealId)
    );

    return reply.status(200).send({
      message: "Meal fetched successfully.",
      data: meal,
    });
  } catch (error) {
    request.log.error(error, "Meal fetch failed");
    throw error;
  }
}

export async function getAllMealsByRestaurantIdHandler(
  request: FastifyRequest<{ Params: { restaurantId: string } }>,
  reply: FastifyReply
) {
  try {
    console.log("🔍 Fetch meals request:", request.params);
    console.log("🔑 Authenticated user:", request.currentAccount);

    if (!request.currentAccount) {
      throw new AuthenticationError("User not authenticated.");
    }

    const { restaurantId } = request.params;

    const meals = await getAllMealsByRestaurantId(
      new Types.ObjectId(restaurantId),
      request.currentAccount._id
    );

    return reply.status(200).send({
      message: "Meals fetched successfully.",
      data: meals,
    });
  } catch (error) {
    request.log.error(error, "Meals fetch failed");
    throw error;
  }
}
