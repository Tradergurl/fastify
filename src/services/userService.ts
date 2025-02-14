import { UserDocument, UserModel } from "../models/user.model";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserResponseDTO,
} from "../interfaces/user.dto";
import { Types, ClientSession } from "mongoose";
import { Logger } from "pino";
import { AppError } from "../types/errors";

export const CreateUser = async (
  data: CreateUserDTO,
  session?: ClientSession
): Promise<UserDocument | null> => {
  try {
    const result = new UserModel(data);
    await result.save({ session });
    return result;
  } catch (error) {
    throw error;
  }
};

export const FindUserByEmail = async (
  email: string,
  session?: ClientSession // Add optional session parameter
): Promise<UserDocument | null> => {
  try {
    const result = await UserModel.findOne(
      {
        email: email.toLowerCase(),
        is_delete: false,
      },
      null,
      { session } // Add session to options
    ).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
    return result;
  } catch (error) {
    console.error("FindUserByEmail error:", error);
    throw error;
  }
};

export const UpdateUser = async (
  id: string,
  data: UpdateUserDTO,
  session?: ClientSession
): Promise<UserDocument | null> => {
  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: id, is_delete: false },
      { $set: data },
      { new: true, session }
    ).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
    return result;
  } catch (error) {
    console.error("UpdateUser error:", error);
    throw error;
  }
};

export const SoftDeleteUser = async (
  id: string,
  session?: ClientSession
): Promise<UserDocument | null> => {
  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: id, is_delete: false },
      { $set: { is_delete: true } },
      { new: true, session }
    ).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
    return result;
  } catch (error) {
    console.error("DeleteUser error:", error);
    throw error;
  }
};

export const GetUserById = async (
  id: string,
  session?: ClientSession
): Promise<UserDocument | null> => {
  try {
    const result = await UserModel.findOne(
      { _id: id, is_delete: false },
      null,
      { session }
    ).select({ __v: 0, created_at: 0, updated_at: 0, is_delete: 0 });
    return result;
  } catch (error) {
    console.error("GetUserById error:", error);
    throw error;
  }
};

export const DeleteUser = async (
  id: string,
  session?: ClientSession
): Promise<UserDocument | null> => {
  try {
    //cron job to delete user after 30 days of soft delete
    const result = await UserModel.findOneAndDelete(
      { _id: id, is_delete: true },
      { session }
    );
    return result;
  } catch (error) {
    console.error("DeleteUser error:", error);
    throw error;
  }
};
