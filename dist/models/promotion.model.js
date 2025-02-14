"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionModel = void 0;
const mongoose_1 = require("mongoose");
const promotionSchema = new mongoose_1.Schema({
    restaurant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    image: {
        type: String,
    },
    discount_type: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
    },
    discount_value: {
        type: Number,
        required: true,
    },
    terms_conditions: {
        type: String,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
// Indexes
promotionSchema.index({ restaurant: 1, is_active: -1 });
exports.PromotionModel = (0, mongoose_1.model)("Promotion", promotionSchema);
