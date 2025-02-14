import mongoose from "mongoose";
import { BadRequestError } from "../types/errors";
import { UserRole } from "../types/enums";
import { AuthProvider } from "../types/enums";
import { UserModel } from "../models/user.model";
import { AccountModel } from "../models/account.model";

export interface SignUpRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  business_details?: {
    company_name: string;
    tax_id: string;
    address: string;
  };
  terms_accepted: boolean;
  marketing_consent: boolean;
}

export async function signUpBusiness(signupData: SignUpRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log("🔑 Starting transaction");

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      business_details,
      terms_accepted,
      marketing_consent,
    } = signupData;

    if (!terms_accepted) {
      throw new BadRequestError("Terms and conditions must be accepted.");
    }

    if (role === UserRole.BUSINESS && !business_details) {
      console.log("🚫 Missing business details");
      const error = new BadRequestError(
        "Business details are required for business accounts."
      );

      throw error;
    }

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      const createdUsers = await UserModel.create(
        [
          {
            email,
            password,
            auth_provider: AuthProvider.LOCAL,
            status: "pending_verification",
            is_email_verified: false,
          },
        ],
        { session }
      );

      user = createdUsers[0];
    }

    // ✅ Create business account
    const account = await AccountModel.create(
      [
        {
          user: user._id,
          role,
          first_name,
          last_name,
          notifications_enabled: true,
          preferences: {
            language: "pl",
            email_notifications: marketing_consent,
            push_notifications: marketing_consent,
          },
          ...(role === UserRole.BUSINESS && { business_details }),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { user, account: account[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
