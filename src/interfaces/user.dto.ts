import { AuthProvider } from "../types/enums";

export interface CreateUserDTO {
  email: string;
  password?: string;
  auth_provider: AuthProvider;
  google_id?: string;
}

export interface UpdateUserDTO {
  status?: "active" | "inactive" | "blocked";
  is_email_verified?: boolean;
  last_login?: Date;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  auth_provider: AuthProvider;
  is_email_verified: boolean;
  status: string;
  created_at: Date;
}
