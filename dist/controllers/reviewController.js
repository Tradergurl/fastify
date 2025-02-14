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
exports.addReviewHandler = addReviewHandler;
exports.updateReviewHandler = updateReviewHandler;
exports.getPaginatedReviewsHandler = getPaginatedReviewsHandler;
exports.getUserReviewsHandler = getUserReviewsHandler;
exports.softDeleteReviewHandler = softDeleteReviewHandler;
exports.hardDeleteReviewHandler = hardDeleteReviewHandler;
const reviewService_1 = require("../services/reviewService");
const mongoose_1 = require("mongoose");
const reviewService_2 = require("../services/reviewService");
function addReviewHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount) {
                return reply.status(401).send({ message: "Unauthorized" });
            }
            const { restaurantId } = request.params;
            const { rating, content, images } = request.body;
            if (!rating || !content) {
                return reply
                    .status(400)
                    .send({ message: "Rating and content are required." });
            }
            // ✅ Call function with correct number of parameters
            const newReview = yield (0, reviewService_1.addReview)(new mongoose_1.Types.ObjectId(restaurantId), request.currentAccount._id, `${request.currentAccount.first_name} ${request.currentAccount.last_name}`, // ✅ User name (optional in function)
            rating, content, request.server.redis, images);
            return reply.status(201).send({ message: "Review added", data: newReview });
        }
        catch (error) {
            request.log.error(error, "Failed to add review");
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
function updateReviewHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount) {
                return reply.status(401).send({ message: "Unauthorized" });
            }
            const { reviewId } = request.params;
            const { rating, content, images } = request.body;
            const userId = new mongoose_1.Types.ObjectId(request.currentAccount._id);
            // ✅ Call service function
            const updatedReview = yield (0, reviewService_1.updateReview)(new mongoose_1.Types.ObjectId(reviewId), userId, request.server.redis, // Pass Redis service for cache invalidation
            rating, content, images);
            return reply.status(200).send({
                message: "Review updated successfully.",
                data: updatedReview,
            });
        }
        catch (error) {
            request.log.error(error, "Updating review failed");
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
function getPaginatedReviewsHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { restaurantId } = request.params;
            const page = parseInt(request.query.page || "1", 10);
            const limit = parseInt(request.query.limit || "10", 10);
            const result = yield (0, reviewService_2.getPaginatedReviews)(new mongoose_1.Types.ObjectId(restaurantId), page, limit);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Fetching restaurant reviews failed");
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
function getUserReviewsHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount) {
                return reply.status(401).send({ message: "Unauthorized" });
            }
            const page = parseInt(request.query.page || "1", 10);
            const limit = parseInt(request.query.limit || "10", 10);
            const userId = new mongoose_1.Types.ObjectId(request.currentAccount._id);
            const result = yield (0, reviewService_2.getUserReviews)(userId, page, limit);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Fetching user reviews failed");
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
// ✅ Soft Delete Review Handler
function softDeleteReviewHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount) {
                return reply.status(401).send({ message: "Unauthorized" });
            }
            const { reviewId } = request.params;
            const userId = new mongoose_1.Types.ObjectId(request.currentAccount._id);
            const result = yield (0, reviewService_2.softDeleteReview)(new mongoose_1.Types.ObjectId(reviewId), userId, request.server.redis);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Soft delete review failed");
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
// ✅ Hard Delete Review Handler
function hardDeleteReviewHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!request.currentAccount) {
                return reply.status(401).send({ message: "Unauthorized" });
            }
            const { reviewId } = request.params;
            const userId = new mongoose_1.Types.ObjectId(request.currentAccount._id);
            const result = yield (0, reviewService_2.hardDeleteReview)(new mongoose_1.Types.ObjectId(reviewId), userId, request.server.redis);
            return reply.status(200).send(result);
        }
        catch (error) {
            request.log.error(error, "Hard delete review failed");
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
//delete review
//soft dele
//responde to review
//get all reviews for a restaurant
//get all reviews for a user
//get review by id
