"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountModel = void 0;
// account.model.ts
const mongoose_1 = require("mongoose");
const enums_1 = require("../types/enums");
const accountSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
        type: String,
        enum: Object.values(enums_1.UserRole),
        required: true,
    },
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: String,
    phone: String,
    notifications_enabled: {
        type: Boolean,
        default: true,
    },
    preferences: {
        language: {
            type: String,
            default: "pl",
        },
        email_notifications: {
            type: Boolean,
            default: true,
        },
        push_notifications: {
            type: Boolean,
            default: true,
        },
    },
    business_details: {
        company_name: String,
        tax_id: String,
        address: String,
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
accountSchema.index({ user: 1, role: 1 }, { unique: true }); // ✅ Prevent duplicate role per user
accountSchema.index({ role: 1 }); // ✅ Still useful for filtering by role
exports.AccountModel = (0, mongoose_1.model)("Account", accountSchema);
