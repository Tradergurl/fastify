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
exports.signUpBusiness = signUpBusiness;
const mongoose_1 = __importDefault(require("mongoose"));
const errors_1 = require("../types/errors");
const enums_1 = require("../types/enums");
const enums_2 = require("../types/enums");
const user_model_1 = require("../models/user.model");
const account_model_1 = require("../models/account.model");
function signUpBusiness(signupData) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        console.log("🔑 Starting transaction");
        try {
            const { email, password, first_name, last_name, role, business_details, terms_accepted, marketing_consent, } = signupData;
            if (!terms_accepted) {
                throw new errors_1.BadRequestError("Terms and conditions must be accepted.");
            }
            if (role === enums_1.UserRole.BUSINESS && !business_details) {
                console.log("🚫 Missing business details");
                const error = new errors_1.BadRequestError("Business details are required for business accounts.");
                throw error;
            }
            let user = yield user_model_1.UserModel.findOne({ email }).session(session);
            if (!user) {
                const createdUsers = yield user_model_1.UserModel.create([
                    {
                        email,
                        password,
                        auth_provider: enums_2.AuthProvider.LOCAL,
                        status: "pending_verification",
                        is_email_verified: false,
                    },
                ], { session });
                user = createdUsers[0];
            }
            // ✅ Create business account
            const account = yield account_model_1.AccountModel.create([
                Object.assign({ user: user._id, role,
                    first_name,
                    last_name, notifications_enabled: true, preferences: {
                        language: "pl",
                        email_notifications: marketing_consent,
                        push_notifications: marketing_consent,
                    } }, (role === enums_1.UserRole.BUSINESS && { business_details })),
            ], { session });
            yield session.commitTransaction();
            return { user, account: account[0] };
        }
        catch (error) {
            yield session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    });
}
