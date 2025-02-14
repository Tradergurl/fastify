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
exports.reviewRoutes = reviewRoutes;
const reviewController_1 = require("../controllers/reviewController");
const passport_1 = __importDefault(require("@fastify/passport"));
function reviewRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.route({
            method: "POST",
            url: "/restaurant/:restaurantId/review",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: reviewController_1.addReviewHandler,
        });
        fastify.route({
            method: "PUT",
            url: "/restaurant/:restaurantId/review/:reviewId",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: reviewController_1.updateReviewHandler,
        });
        fastify.route({
            method: "GET",
            url: "/reviews/restaurant/:restaurantId",
            handler: reviewController_1.getPaginatedReviewsHandler,
        });
        fastify.route({
            method: "GET",
            url: "/reviews/user",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: reviewController_1.getUserReviewsHandler,
        });
        fastify.route({
            method: "PUT",
            url: "/reviews/:reviewId/soft-delete",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: reviewController_1.softDeleteReviewHandler,
        });
        fastify.route({
            method: "DELETE",
            url: "/reviews/:reviewId",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: reviewController_1.hardDeleteReviewHandler,
        });
    });
}
