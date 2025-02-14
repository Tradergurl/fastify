"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFavoriteModel = void 0;
const mongoose_1 = require("mongoose");
const userFavoriteSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        unique: true,
    },
    restaurants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Restaurant" }],
}, {
    timestamps: { createdAt: "created_at", updatedAt: false },
});
// Index to speed up queries
userFavoriteSchema.index({ user: 1, restaurants: 1 });
exports.UserFavoriteModel = (0, mongoose_1.model)("UserFavorite", userFavoriteSchema);
