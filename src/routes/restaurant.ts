import { FastifyInstance } from "fastify";
import {
  createRestaurantHandler,
  updateRestaurantHandler,
  softDeleteRestaurantHandler,
  deleteRestaurantHandler,
  getRestaurantBusinessHandler,
  addMealHandler,
  updateMealHandler,
  getMealByIdHandler,
  getAllMealsByRestaurantIdHandler,
  getRestaurantClientHandler,
} from "../controllers/restaurantController";
import { RestaurantSchemas } from "../schemas/restaurant.schema";
import fastifyPassport from "@fastify/passport";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
export async function restaurantRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/business/",
    preValidation: [
      (request, reply, done) => {
        done();
      },
      fastifyPassport.authenticate("jwt", { session: false }),
    ],
    schema: {
      body: RestaurantSchemas.body.createRestaurant,
      response: RestaurantSchemas.response.createRestaurant,
    },
    handler: createRestaurantHandler,
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "PUT",
    url: "/business/:id",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: updateRestaurantHandler,
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "PATCH",
    url: "/business/:id/deactivate",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: softDeleteRestaurantHandler,
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "DELETE",
    url: "/business/:id",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: deleteRestaurantHandler,
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "GET",
    url: "/business/:id",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: getRestaurantBusinessHandler,
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "GET",
    url: "/:id",
    handler: getRestaurantClientHandler,
  });

  fastify.route({
    method: "POST",
    url: "/business/:id/meal",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: addMealHandler,
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "PUT",
    url: "/business/:id/meal/:mealId",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    schema: {
      params: Type.Object({
        id: Type.String({ minLength: 24, maxLength: 24 }),
        mealId: Type.String({ minLength: 24, maxLength: 24 }),
      }),
      //body: UpdateMealSchema,
    },
    handler: updateMealHandler,
  });

  fastify.route({
    method: "GET",
    url: "/business/:id/meal/:mealId",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: getMealByIdHandler,
  });

  fastify.route({
    method: "GET",
    url: "/business/:id/meals",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: getAllMealsByRestaurantIdHandler,
  });
}
