// utils/auth.ts
import { UserDocument } from "../models/user.model";
import { AccountDocument } from "../models/account.model";
import { signJwt } from "../utils/jwt";

interface AuthResponseData {
  _id: string;
  token: string;
  account: {
    _id: string;
    user: {
      _id: string;
      email: string;
      status: "active" | "inactive" | "pending" | "blocked" | "deleted"; // ✅ Now matches CommonTypes.Status
    };
    role: "client" | "business" | "admin"; // ✅ Now matches CommonTypes.UserType
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  businessSetup: {
    required: boolean;
    missingFields: string[] | undefined;
  };
}

interface AuthResponse {
  message: string;
  data: AuthResponseData;
}

export function createAuthResponse(
  account: AccountDocument,
  user: UserDocument,
  message: string,
  includeToken = true
): AuthResponse {
  const token = includeToken
    ? signJwt(user._id.toString(), account._id.toString(), account.role)
    : "";

  return {
    message,
    data: {
      token: token || "",
      _id: account._id.toString(),
      account: {
        // ✅ Ensure "account" key is present
        _id: account._id.toString(),
        user: {
          _id: user._id.toString(),
          email: user.email,
          status: user.status as
            | "active"
            | "inactive"
            | "pending"
            | "blocked"
            | "deleted",
        },
        role: account.role as "client" | "business" | "admin",
        first_name: account.first_name,
        last_name: account.last_name,
        avatar: account.avatar,
      },
      businessSetup: {
        required: false,
        missingFields: undefined,
      },
    },
  };
}
