// account.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../types/enums";

export interface AccountDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone?: string;
  notifications_enabled: boolean;
  preferences?: {
    language: string;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  business_details?: {
    company_name: string;
    tax_id: string;
    address: string;
  };
  created_at: Date;
  updated_at: Date;
}

const accountSchema = new Schema<AccountDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: String,
    phone: String,
    notifications_enabled: {
      type: Boolean,
      default: true,
    },
    preferences: {
      language: {
        type: String,
        default: "pl",
      },
      email_notifications: {
        type: Boolean,
        default: true,
      },
      push_notifications: {
        type: Boolean,
        default: true,
      },
    },
    business_details: {
      company_name: String,
      tax_id: String,
      address: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

accountSchema.index({ user: 1, role: 1 }, { unique: true }); // ✅ Prevent duplicate role per user
accountSchema.index({ role: 1 }); // ✅ Still useful for filtering by role

export const AccountModel = model<AccountDocument>("Account", accountSchema);
