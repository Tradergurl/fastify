// user.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { AuthProvider } from "../types/enums";
import argon2 from "argon2";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  auth_provider: AuthProvider;
  google_id?: string;
  is_email_verified: boolean;
  verification_data: {
    token: string;
    expires: Date;
    attempts: number;
    verified: boolean;
  };
  status: "active" | "inactive" | "blocked";
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
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
      enum: Object.values(AuthProvider),
      required: true,
      default: AuthProvider.LOCAL,
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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

userSchema.index({ google_id: 1 }, { unique: true }); // ✅ Only unique when exists
userSchema.index({ email: 1, auth_provider: 1 }, { unique: true }); // ✅ Allow different emails per auth provider

userSchema.pre("save", async function (next) {
  try {
    const user = this as UserDocument;

    if (!user.isModified("password")) {
      return next();
    }

    if (user.password) {
      user.password = await argon2.hash(user.password);
    }

    next();
  } catch (error) {
    throw new Error("Error hashing password");
  }
});

userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  try {
    if (!this.password) {
      return false;
    }
    return await argon2.verify(this.password, enteredPassword);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

export const UserModel = model<UserDocument>("User", userSchema);
