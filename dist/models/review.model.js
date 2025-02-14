"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
// models/review.model.ts
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    restaurant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    user_name: {
        type: String,
    },
    user_avatar: {
        type: String,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    content: {
        type: String,
        required: true,
    },
    images: [String],
    restaurant_response: {
        content: String,
        created_at: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
// Indexes for common queries
reviewSchema.index({ restaurant: 1, created_at: -1 }); // List reviews for restaurant
reviewSchema.index({ user: 1, created_at: -1 }); // User's reviews
reviewSchema.index({ restaurant: 1, rating: -1 }); // Restaurant ratings
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true }); // One review per user per restaurant
exports.ReviewModel = (0, mongoose_1.model)("Review", reviewSchema);
