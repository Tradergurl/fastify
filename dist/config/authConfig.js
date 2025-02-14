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
exports.createGoogleStrategy = createGoogleStrategy;
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const userService_1 = require("../services/userService");
const accountService_1 = require("../services/accountService");
const enums_1 = require("../types/enums");
const authResponse_1 = require("../utils/authResponse");
const accountService_2 = require("../services/accountService");
dotenv_1.default.config();
function createGoogleStrategy(fastify) {
    const googleClientID = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!googleClientID || !googleClientSecret) {
        fastify.log.warn("Google OAuth credentials are missing.");
        return null;
    }
    return new passport_google_oauth20_1.Strategy({
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
        scope: ["profile", "email"],
        passReqToCallback: true,
    }, (request, accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            if (!email) {
                return done(null, false, { message: "Google email is required" });
            }
            const requestedRole = request.query.role;
            if (!requestedRole || !["client", "business"].includes(requestedRole)) {
                return done(null, false, { message: "Invalid role" });
            }
            let user = yield (0, userService_1.FindUserByEmail)(email);
            let account;
            if (!user) {
                // Create a new user if not found
                user = yield (0, userService_1.CreateUser)({
                    email,
                    auth_provider: enums_1.AuthProvider.GOOGLE,
                    google_id: profile.id,
                });
                if (!user) {
                    return done(null, false, { message: "Failed to create user" });
                }
                // Create a new account for this user
                account = yield (0, accountService_1.CreateAccount)({
                    user: user._id,
                    role: requestedRole, // Default role
                    first_name: ((_c = profile.name) === null || _c === void 0 ? void 0 : _c.givenName) || "",
                    last_name: ((_d = profile.name) === null || _d === void 0 ? void 0 : _d.familyName) || "",
                    avatar: ((_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || undefined,
                });
            }
            else {
                // User exists, check if they have an account
                account = yield (0, accountService_2.FindAccountByUserId)(user._id);
                if (!account) {
                    // 🔥 User exists but account is missing → Create a new account
                    account = yield (0, accountService_1.CreateAccount)({
                        user: user._id,
                        role: requestedRole, // Default role
                        first_name: ((_g = profile.name) === null || _g === void 0 ? void 0 : _g.givenName) || "",
                        last_name: ((_h = profile.name) === null || _h === void 0 ? void 0 : _h.familyName) || "",
                        avatar: ((_k = (_j = profile.photos) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.value) || undefined,
                    });
                }
            }
            if (!account) {
                return done(null, false, { message: "Failed to create account" });
            }
            // ✅ Now `account` is always defined
            const response = (0, authResponse_1.createAuthResponse)(account, user, "Authentication successful");
            return done(null, response);
        }
        catch (error) {
            return done(error, false);
        }
    }));
}
