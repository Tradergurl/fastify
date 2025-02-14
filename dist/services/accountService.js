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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAccountByUserIdAndRole = exports.FindAccountByUserId = void 0;
exports.CreateAccount = CreateAccount;
const account_model_1 = require("../models/account.model");
function CreateAccount(data, session) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data.role) {
            throw new Error("Role is required when creating an account.");
        }
        const account = new account_model_1.AccountModel({
            user: data.user,
            role: data.role, // ✅ Ensure role is set
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            notifications_enabled: true,
            preferences: {
                language: "pl",
                email_notifications: data.marketing_consent,
                push_notifications: data.marketing_consent,
            },
        });
        yield account.save({ session });
        return account;
    });
}
const FindAccountByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield account_model_1.AccountModel.findOne({ user: userId });
        return account;
    }
    catch (error) {
        console.error(error);
        return null;
    }
});
exports.FindAccountByUserId = FindAccountByUserId;
const FindAccountByUserIdAndRole = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield account_model_1.AccountModel.findOne({ user: userId, role });
        return account;
    }
    catch (error) {
        console.error(error);
        return null;
    }
});
exports.FindAccountByUserIdAndRole = FindAccountByUserIdAndRole;
