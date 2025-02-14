"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealModel = void 0;
// meal.model.ts
const mongoose_1 = require("mongoose");
const enums_1 = require("../types/enums");
const mealSchema = new mongoose_1.Schema({
    restaurant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    ingredients: [
        {
            type: String,
            required: true,
        },
    ],
    allergens: [String],
    is_vegan: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(enums_1.MealType),
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    status: {
        is_available: { type: Boolean, default: true },
        is_active: { type: Boolean, default: true },
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
mealSchema.index({ restaurant: 1 });
mealSchema.index({ name: 1 });
mealSchema.index({ category: 1 });
mealSchema.index({ is_vegan: 1 });
mealSchema.index({ likes: -1 });
exports.MealModel = (0, mongoose_1.model)("Meal", mealSchema);
