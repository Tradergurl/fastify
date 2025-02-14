import { FastifyInstance } from "fastify";
import {
  toggleFavoriteHandler,
  getFavoritesHandler,
  getFavoriteStatusesHandler,
} from "../controllers/favoriteController";
import fastifyPassport from "@fastify/passport";

export async function favoriteRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/toggle/:restaurantId",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: toggleFavoriteHandler,
  });

  fastify.route({
    method: "GET",
    url: "/",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: getFavoritesHandler,
  });

  fastify.route({
    method: "GET",
    url: "/statuses",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: getFavoriteStatusesHandler,
  });
}
