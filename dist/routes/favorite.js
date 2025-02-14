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
exports.favoriteRoutes = favoriteRoutes;
const favoriteController_1 = require("../controllers/favoriteController");
const passport_1 = __importDefault(require("@fastify/passport"));
function favoriteRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.route({
            method: "POST",
            url: "/toggle/:restaurantId",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: favoriteController_1.toggleFavoriteHandler,
        });
        fastify.route({
            method: "GET",
            url: "/",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: favoriteController_1.getFavoritesHandler,
        });
        fastify.route({
            method: "GET",
            url: "/statuses",
            preValidation: [passport_1.default.authenticate("jwt", { session: false })],
            handler: favoriteController_1.getFavoriteStatusesHandler,
        });
    });
}
