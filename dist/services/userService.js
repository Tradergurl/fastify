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
exports.DeleteUser = exports.GetUserById = exports.SoftDeleteUser = exports.UpdateUser = exports.FindUserByEmail = exports.CreateUser = void 0;
const user_model_1 = require("../models/user.model");
const CreateUser = (data, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = new user_model_1.UserModel(data);
        yield result.save({ session });
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.CreateUser = CreateUser;
const FindUserByEmail = (email, session // Add optional session parameter
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_model_1.UserModel.findOne({
            email: email.toLowerCase(),
            is_delete: false,
        }, null, { session } // Add session to options
        ).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
        return result;
    }
    catch (error) {
        console.error("FindUserByEmail error:", error);
        throw error;
    }
});
exports.FindUserByEmail = FindUserByEmail;
const UpdateUser = (id, data, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_model_1.UserModel.findOneAndUpdate({ _id: id, is_delete: false }, { $set: data }, { new: true, session }).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
        return result;
    }
    catch (error) {
        console.error("UpdateUser error:", error);
        throw error;
    }
});
exports.UpdateUser = UpdateUser;
const SoftDeleteUser = (id, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_model_1.UserModel.findOneAndUpdate({ _id: id, is_delete: false }, { $set: { is_delete: true } }, { new: true, session }).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
        return result;
    }
    catch (error) {
        console.error("DeleteUser error:", error);
        throw error;
    }
});
exports.SoftDeleteUser = SoftDeleteUser;
const GetUserById = (id, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_model_1.UserModel.findOne({ _id: id, is_delete: false }, null, { session }).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
        return result;
    }
    catch (error) {
        console.error("GetUserById error:", error);
        throw error;
    }
});
exports.GetUserById = GetUserById;
const DeleteUser = (id, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //cron job to delete user after 30 days of soft delete
        const result = yield user_model_1.UserModel.findOneAndDelete({ _id: id, is_delete: true }, { session });
        return result;
    }
    catch (error) {
        console.error("DeleteUser error:", error);
        throw error;
    }
});
exports.DeleteUser = DeleteUser;
