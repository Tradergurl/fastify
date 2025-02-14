// utils/jwt.ts
import jwt from "jsonwebtoken";
import { AuthConfigError } from "../types/errors";
import { SignOptions } from "jsonwebtoken";

export function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (!jwtSecret && isProduction) {
    throw new AuthConfigError(
      "JWT_SECRET environment variable is required in production"
    );
  }

  if (!jwtSecret) {
    throw new AuthConfigError("JWT_SECRET is not configured");
  }

  return jwtSecret;
}

export function signJwt(
  userId: string,
  accountId: string,
  role: string
): string {
  return jwt.sign(
    { userId, accountId, role }, // ✅ Include accountId and role in the payload
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, getJwtSecret()) as T;
}
