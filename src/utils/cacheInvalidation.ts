import { RedisService } from "../config/redis";
import { Types } from "mongoose";

export async function invalidateRestaurantCache(
  restaurantId: Types.ObjectId,
  redis: RedisService
) {
  const clientKey = `restaurant:client:${restaurantId}`;
  const businessKey = `restaurant:business:${restaurantId}`;

  await redis.delete(clientKey);
  await redis.delete(businessKey);
}
