import { UserRole } from "../types/enums";
import { Types } from "mongoose";
// account.dto.ts
export interface CreateAccountDTO {
  user: string | Types.ObjectId;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  notifications_enabled?: boolean;
  preferences?: {
    language: string;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  business_details?: {
    company_name: string;
    tax_id: string;
    address: string;
    logo?: string;
  };
  avatar?: string;
  marketing_consent?: boolean;
  terms_accepted?: boolean;
}

export interface UpdateAccountDTO {
  first_name?: string;
  last_name?: string;
  avatar?: string;
  phone?: string;
  notifications_enabled?: boolean;
  preferences?: {
    language?: string;
    email_notifications?: boolean;
    push_notifications?: boolean;
  };
  business_details?: {
    company_name?: string;
    tax_id?: string;
    address?: string;
    logo?: string;
  };
}

export interface AccountResponseDTO {
  id: string;
  user: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone?: string;
  notifications_enabled: boolean;
  preferences: {
    language: string;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  business_details?: {
    company_name: string;
    tax_id: string;
    address: string;
    logo?: string;
  };
  created_at: Date;
}
