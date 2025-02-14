"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = getJwtSecret;
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
// utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../types/errors");
function getJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    const isProduction = process.env.NODE_ENV === "production";
    if (!jwtSecret && isProduction) {
        throw new errors_1.AuthConfigError("JWT_SECRET environment variable is required in production");
    }
    if (!jwtSecret) {
        throw new errors_1.AuthConfigError("JWT_SECRET is not configured");
    }
    return jwtSecret;
}
function signJwt(userId, accountId, role) {
    return jsonwebtoken_1.default.sign({ userId, accountId, role }, // ✅ Include accountId and role in the payload
    process.env.JWT_SECRET, { expiresIn: "7d" });
}
function verifyJwt(token) {
    return jsonwebtoken_1.default.verify(token, getJwtSecret());
}
