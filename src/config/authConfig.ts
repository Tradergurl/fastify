import { FastifyInstance } from "fastify";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { FindUserByEmail, CreateUser } from "../services/userService";
import { CreateAccount } from "../services/accountService";
import { AuthProvider, UserRole } from "../types/enums";
import { signJwt } from "../utils/jwt";
import { Types } from "mongoose";
import { createAuthResponse } from "../utils/authResponse";
import { FindAccountByUserId } from "../services/accountService";

dotenv.config();

export function createGoogleStrategy(fastify: FastifyInstance) {
  const googleClientID = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientID || !googleClientSecret) {
    fastify.log.warn("Google OAuth credentials are missing.");
    return null;
  }

  return new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "Google email is required" });
        }
        const requestedRole = request.query.role as string;
        if (!requestedRole || !["client", "business"].includes(requestedRole)) {
          return done(null, false, { message: "Invalid role" });
        }

        let user = await FindUserByEmail(email);
        let account;

        if (!user) {
          // Create a new user if not found
          user = await CreateUser({
            email,
            auth_provider: AuthProvider.GOOGLE,
            google_id: profile.id,
          });

          if (!user) {
            return done(null, false, { message: "Failed to create user" });
          }

          // Create a new account for this user
          account = await CreateAccount({
            user: user._id,
            role: requestedRole as UserRole, // Default role
            first_name: profile.name?.givenName || "",
            last_name: profile.name?.familyName || "",
            avatar: profile.photos?.[0]?.value || undefined,
          });
        } else {
          // User exists, check if they have an account
          account = await FindAccountByUserId(user._id);

          if (!account) {
            // 🔥 User exists but account is missing → Create a new account
            account = await CreateAccount({
              user: user._id,
              role: requestedRole as UserRole, // Default role
              first_name: profile.name?.givenName || "",
              last_name: profile.name?.familyName || "",
              avatar: profile.photos?.[0]?.value || undefined,
            });
          }
        }

        if (!account) {
          return done(null, false, { message: "Failed to create account" });
        }

        // ✅ Now `account` is always defined
        const response = createAuthResponse(
          account,
          user,
          "Authentication successful"
        );

        return done(null, response);
      } catch (error) {
        return done(error, false);
      }
    }
  );
}
