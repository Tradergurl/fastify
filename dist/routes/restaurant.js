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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantRoutes = restaurantRoutes;
const restaurantController_1 = require("../controllers/restaurantController");
const restaurant_schema_1 = require("../schemas/restaurant.schema");
const passport_1 = __importDefault(require("@fastify/passport"));
const typebox_1 = require("@sinclair/typebox");
function restaurantRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.withTypeProvider().route({
            method: "POST",
            url: "/business/",
            preValidation: [
                (request, reply, done) => {
                    done();
                },
                passport_1.default.authenticate("jwt", { session: false }),
            ],
            schema: {
                body: restaurant_schema_1.RestaurantSchemas.body.createRestaurant,
                response: restaurant_schema_1.RestaurantSchemas.response.createRestaurant,
            },
            handler: restaurantController_1.createRestaurantHandler,
        });
        fastify.withTypeProvider().route({
            method: "PUT",
            url: "/business/:id",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.updateRestaurantHandler,
        });
        fastify.withTypeProvider().route({
            method: "PATCH",
            url: "/business/:id/deactivate",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.softDeleteRestaurantHandler,
        });
        fastify.withTypeProvider().route({
            method: "DELETE",
            url: "/business/:id",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.deleteRestaurantHandler,
        });
        fastify.withTypeProvider().route({
            method: "GET",
            url: "/business/:id",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.getRestaurantBusinessHandler,
        });
        fastify.withTypeProvider().route({
            method: "GET",
            url: "/:id",
            handler: restaurantController_1.getRestaurantClientHandler,
        });
        fastify.route({
            method: "POST",
            url: "/business/:id/meal",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.addMealHandler,
        });
        fastify.withTypeProvider().route({
            method: "PUT",
            url: "/business/:id/meal/:mealId",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            schema: {
                params: typebox_1.Type.Object({
                    id: typebox_1.Type.String({ minLength: 24, maxLength: 24 }),
                    mealId: typebox_1.Type.String({ minLength: 24, maxLength: 24 }),
                }),
                //body: UpdateMealSchema,
            },
            handler: restaurantController_1.updateMealHandler,
        });
        fastify.route({
            method: "GET",
            url: "/business/:id/meal/:mealId",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.getMealByIdHandler,
        });
        fastify.route({
            method: "GET",
            url: "/business/:id/meals",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: restaurantController_1.getAllMealsByRestaurantIdHandler,
        });
    });
}
