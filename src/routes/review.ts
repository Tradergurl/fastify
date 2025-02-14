import { FastifyInstance } from "fastify";
import {
  addReviewHandler,
  updateReviewHandler,
  softDeleteReviewHandler,
  hardDeleteReviewHandler,
  getPaginatedReviewsHandler,
  getUserReviewsHandler,
} from "../controllers/reviewController";
import fastifyPassport from "@fastify/passport";

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/restaurant/:restaurantId/review",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: addReviewHandler,
  });
  fastify.route({
    method: "PUT",
    url: "/restaurant/:restaurantId/review/:reviewId",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: updateReviewHandler,
  });
  fastify.route({
    method: "GET",
    url: "/reviews/restaurant/:restaurantId",
    handler: getPaginatedReviewsHandler,
  });
  fastify.route({
    method: "GET",
    url: "/reviews/user",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: getUserReviewsHandler,
  });
  fastify.route({
    method: "PUT",
    url: "/reviews/:reviewId/soft-delete",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: softDeleteReviewHandler,
  });
  fastify.route({
    method: "DELETE",
    url: "/reviews/:reviewId",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: hardDeleteReviewHandler,
  });
}
