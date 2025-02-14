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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavoriteHandler = toggleFavoriteHandler;
exports.getFavoritesHandler = getFavoritesHandler;
exports.getFavoriteStatusesHandler = getFavoriteStatusesHandler;
const favoriteService_1 = require("../services/favoriteService");
const mongoose_1 = require("mongoose");
const errors_1 = require("../types/errors");
function toggleFavoriteHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 toggleFavoriteHandler");
            console.log("🔄 request.currentAccount", request.currentAccount);
            if (!request.currentAccount)
                throw new errors_1.AuthenticationError("User not authenticated.");
            const { restaurantId } = request.params;
            console.log("🔄 restaurantId", restaurantId);
            if (!restaurantId)
                throw new errors_1.BadRequestError("Restaurant ID is required");
            const result = yield (0, favoriteService_1.toggleFavorite)(request.currentAccount._id, new mongoose_1.Types.ObjectId(restaurantId), request.server.redis);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Favorite toggle failed");
            throw error;
        }
    });
}
// 📌 Get All Favorite Restaurants
function getFavoritesHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount)
                throw new Error("User not authenticated.");
            const favorites = yield (0, favoriteService_1.getFavoriteRestaurants)(request.currentAccount._id, request.server.redis);
            return reply.status(200).send({ favorites });
        }
        catch (error) {
            request.log.error(error, "Fetching favorites failed");
            throw error;
        }
    });
}
function getFavoriteStatusesHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount)
                throw new Error("User not authenticated.");
            const restaurantIds = request.query.restaurantIds
                .split(",")
                .map((id) => new mongoose_1.Types.ObjectId(id));
            const statuses = yield (0, favoriteService_1.getMultipleFavoriteStatuses)(request.currentAccount._id, restaurantIds, request.server.redis);
            console.log("🔄 statuses", statuses);
            return reply.status(200).send({ statuses });
        }
        catch (error) {
            request.log.error(error, "Fetching favorite statuses failed");
            throw error;
        }
    });
}
