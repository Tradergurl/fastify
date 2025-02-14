import { FastifyRequest, FastifyReply } from "fastify";
import {
  toggleFavorite,
  getFavoriteRestaurants,
  getMultipleFavoriteStatuses,
} from "../services/favoriteService";
import { Types } from "mongoose";
import { AuthenticationError, BadRequestError } from "../types/errors";

export async function toggleFavoriteHandler(
  request: FastifyRequest<{ Params: { restaurantId: string } }>,
  reply: FastifyReply
) {
  try {
    console.log("🔄 toggleFavoriteHandler");
    console.log("🔄 request.currentAccount", request.currentAccount);
    if (!request.currentAccount)
      throw new AuthenticationError("User not authenticated.");

    const { restaurantId } = request.params;
    console.log("🔄 restaurantId", restaurantId);
    if (!restaurantId) throw new BadRequestError("Restaurant ID is required");

    const result = await toggleFavorite(
      request.currentAccount._id,
      new Types.ObjectId(restaurantId),
      request.server.redis
    );

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Favorite toggle failed");
    throw error;
  }
}

// 📌 Get All Favorite Restaurants
export async function getFavoritesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) throw new Error("User not authenticated.");

    const favorites = await getFavoriteRestaurants(
      request.currentAccount._id,
      request.server.redis
    );

    return reply.status(200).send({ favorites });
  } catch (error) {
    request.log.error(error, "Fetching favorites failed");
    throw error;
  }
}

export async function getFavoriteStatusesHandler(
  request: FastifyRequest<{ Querystring: { restaurantIds: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) throw new Error("User not authenticated.");

    const restaurantIds = request.query.restaurantIds
      .split(",")
      .map((id) => new Types.ObjectId(id));
    const statuses = await getMultipleFavoriteStatuses(
      request.currentAccount._id,
      restaurantIds,
      request.server.redis
    );
    console.log("🔄 statuses", statuses);

    return reply.status(200).send({ statuses });
  } catch (error) {
    request.log.error(error, "Fetching favorite statuses failed");
    throw error;
  }
}
