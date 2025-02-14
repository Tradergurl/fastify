"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealLikeModel = void 0;
const mongoose_1 = require("mongoose");
const mealLikeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    meal: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Meal",
        required: true,
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: false,
    },
});
// Indexes
mealLikeSchema.index({ user: 1, meal: 1 }, { unique: true }); // Prevent duplicate likes
mealLikeSchema.index({ meal: 1 }); // Count likes for meal
exports.MealLikeModel = (0, mongoose_1.model)("MealLike", mealLikeSchema);
