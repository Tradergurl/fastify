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
exports.UserModel = void 0;
// user.model.ts
const mongoose_1 = require("mongoose");
const enums_1 = require("../types/enums");
const argon2_1 = __importDefault(require("argon2"));
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,
    },
    auth_provider: {
        type: String,
        enum: Object.values(enums_1.AuthProvider),
        required: true,
        default: enums_1.AuthProvider.LOCAL,
    },
    google_id: {
        type: String,
        sparse: true,
    },
    is_email_verified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["active", "inactive", "blocked", "pending_verification"],
        default: "inactive",
    },
    last_login: {
        type: Date,
    },
    verification_data: {
        token: String,
        expires: Date,
        attempts: Number,
        verified: Boolean,
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
userSchema.index({ google_id: 1 }, { unique: true }); // ✅ Only unique when exists
userSchema.index({ email: 1, auth_provider: 1 }, { unique: true }); // ✅ Allow different emails per auth provider
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = this;
            if (!user.isModified("password")) {
                return next();
            }
            if (user.password) {
                user.password = yield argon2_1.default.hash(user.password);
            }
            next();
        }
        catch (error) {
            throw new Error("Error hashing password");
        }
    });
});
userSchema.methods.comparePassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!this.password) {
                return false;
            }
            return yield argon2_1.default.verify(this.password, enteredPassword);
        }
        catch (error) {
            throw new Error("Error comparing passwords");
        }
    });
};
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
