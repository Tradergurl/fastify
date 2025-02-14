import { CreateAccountDTO } from "../interfaces/account.dto";
import { AccountModel } from "../models/account.model";
import { Types, ClientSession } from "mongoose";
import { AccountDocument } from "../models/account.model";
import { UserRole } from "../types/enums";

export async function CreateAccount(
  data: CreateAccountDTO,
  session?: ClientSession
) {
  if (!data.role) {
    throw new Error("Role is required when creating an account.");
  }

  const account = new AccountModel({
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

  await account.save({ session });
  return account;
}

export const FindAccountByUserId = async (
  userId: Types.ObjectId
): Promise<AccountDocument | null> => {
  try {
    const account = await AccountModel.findOne({ user: userId });
    return account;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const FindAccountByUserIdAndRole = async (
  userId: Types.ObjectId,
  role: UserRole
): Promise<AccountDocument | null> => {
  try {
    const account = await AccountModel.findOne({ user: userId, role });
    return account;
  } catch (error) {
    console.error(error);
    return null;
  }
};
