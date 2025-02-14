import { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import {
  FindUserByEmail,
  CreateUser,
  UpdateUser,
} from "../services/userService";
import { Logger } from "pino";
import { AppError } from "../types/errors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { CreateUserDTO, UpdateUserDTO } from "../interfaces/user.dto";
import { CreateAccountDTO, UpdateAccountDTO } from "../interfaces/account.dto";
import { UserRole, AuthProvider } from "../types/enums";
import { Types } from "mongoose";
import { CreateAccount } from "../services/accountService";
import { AuthConfigError, TokenError } from "../types/errors";
import { createGoogleStrategy } from "./authConfig";
import { signJwt } from "../utils/jwt";
import { FindAccountByUserIdAndRole } from "../services/accountService";
import { UserDocument, UserModel } from "../models/user.model";
import { AccountModel } from "../models/account.model";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/mail";

dotenv.config();

interface SignUpRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  business_details?: {
    company_name: string;
    tax_id: string;
    address: string;
  };
  terms_accepted: boolean;
  marketing_consent: boolean;
}

/*
const localSignupStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (request: any, email: string, password: string, done: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        first_name,
        last_name,
        phone,
        business_details,
        terms_accepted,
        marketing_consent,
      } = request.body as Omit<SignUpRequest, "role">;

      if (!terms_accepted) {
        await session.abortTransaction();
        return done(null, {
          error: true,
          message: "Terms and conditions must be accepted",
        });
      }

      // ✅ Determine role based on endpoint URL
      let role: UserRole;
      if (request.originalUrl.includes("/client/signup")) {
        role = UserRole.CLIENT;
      } else if (request.originalUrl.includes("/business/signup")) {
        role = UserRole.BUSINESS;
      } else {
        await session.abortTransaction();
        return done(null, {
          error: true,
          message: "Invalid signup endpoint",
        });
      }

      console.log("🔍 Assigned Role:", role);

      if (role === UserRole.BUSINESS && !business_details) {
        await session.abortTransaction();
        return done(null, {
          error: true,
          message: "Business details are required for business accounts",
        });
      }

      let user = await FindUserByEmail(email);
      if (user) {
        await session.abortTransaction();
        return done(null, {
          error: true,
          message: "User already exists",
        });
      }

      const userData: CreateUserDTO = {
        email,
        password,
        auth_provider: AuthProvider.LOCAL,
      };

      user = await CreateUser(userData, session);

      // ✅ Log user ID after creation
      console.log("✅ Created User:", user);

      if (!user) {
        await session.abortTransaction();
        return done(null, {
          error: true,
          message: "Failed to create user",
        });
      }

      const accountData: CreateAccountDTO = {
        user: user._id, // Ensure this is correct
        role,
        first_name,
        last_name,
        phone,
        notifications_enabled: true,
        preferences: {
          language: "pl",
          email_notifications: marketing_consent,
          push_notifications: marketing_consent,
        },
        ...(role === UserRole.BUSINESS && { business_details }),
      };

      const account = await CreateAccount(accountData, session);

      // ✅ Log account immediately after creation
      console.log("✅ Created Account:", account);

      if (!account) {
        await session.abortTransaction();
        return done(null, {
          error: true,
          message: "Failed to create account",
        });
      }

      await session.commitTransaction();

      // ✅ Log user ID before sending response
      console.log("🔑 User ID before sending response:", user._id);
      const userWithAccount = { ...user.toObject(), account };

      return done(null, userWithAccount);

      // 🔑 Return role-specific authentication response
    } catch (error) {
      await session.abortTransaction();
      return done(error, false);
    } finally {
      session.endSession();
    }
  }
);
*/

const localSignupStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (request: any, email: string, password: string, done: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        first_name,
        last_name,
        phone,
        role,
        business_details,
        terms_accepted,
        marketing_consent,
      } = request.body as SignUpRequest;

      if (!terms_accepted) {
        await session.abortTransaction();
        return done(null, false, {
          message: "Terms and conditions must be accepted",
        });
      }

      if (role === UserRole.BUSINESS && !business_details) {
        await session.abortTransaction();
        return done(null, false, {
          message: "Business details are required for business accounts",
        });
      }
      const generateVerificationToken = () => {
        return {
          token: crypto.randomBytes(32).toString("hex"),
          expires: new Date(Date.now() + 3600000), // 1 hour from now
          attempts: 0,
          verified: false,
        };
      };

      // Usage in your code
      const verificationData = generateVerificationToken();
      // ✅ Find existing user in the same session
      let user = await UserModel.findOne({ email }).session(session);

      if (user) {
        // ✅ Check if the user already has the requested role
        const existingAccounts = await AccountModel.find({
          user: user._id,
        }).session(session);

        const hasClientAccount = existingAccounts.some(
          (acc) => acc.role === UserRole.CLIENT
        );
        const hasBusinessAccount = existingAccounts.some(
          (acc) => acc.role === UserRole.BUSINESS
        );

        if (role === UserRole.CLIENT && hasClientAccount) {
          await session.abortTransaction();
          return done(null, {
            error: true,
            message: "You already have a client account. Please sign in.",
          });
        }

        const validateBusinessDetails = (details: any) => {
          if (!details) return false;

          const requiredFields = ["company_name", "tax_id", "address"];
          return requiredFields.every(
            (field) =>
              details[field] &&
              typeof details[field] === "string" &&
              details[field].trim().length > 0
          );
        };

        if (role === UserRole.BUSINESS && hasBusinessAccount) {
          if (!validateBusinessDetails(business_details)) {
            await session.abortTransaction();
            return done(null, {
              error: true,
              message: "Complete business details are required",
              requiredFields: ["company_name", "tax_id", "address"],
            });
          }
        }

        // ✅ User exists but doesn't have the requested role → Add new account
        const newAccount = await AccountModel.create(
          [
            {
              user: user._id,
              role,
              first_name,
              last_name,
              phone,
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

        return done(null, user);
      }

      // ✅ If no user exists, create a new user **inside the session**
      const createdUsers = await UserModel.create(
        [
          {
            email,
            password,
            auth_provider: AuthProvider.LOCAL,
            verification_data: verificationData,
            status: "pending_verification",
            is_email_verified: false,
          },
        ],
        { session }
      );

      try {
        await sendVerificationEmail(
          createdUsers[0].email,
          verificationData.token
        );
      } catch (emailError) {
        console.error("📧 Failed to send verification email:", emailError);
        // Don't fail the registration, but log the error
        // The user can request a new verification email later
      }

      user = createdUsers[0]; // Assign the first created user

      if (!user || !user._id) {
        throw new Error("User creation failed, missing _id");
      }

      // ✅ Create account
      const account = await AccountModel.create(
        [
          {
            user: user._id,
            role,
            first_name,
            last_name,
            phone,
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

      return done(null, user);
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Signup Error:", error);
      return done(error, false);
    } finally {
      session.endSession();
    }
  }
);

const localSigninStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (request: any, email: string, password: string, done: any) => {
    try {
      const { role } = request.body;

      // ✅ Step 1: Find User
      const user = await UserModel.findOne({
        email,
        auth_provider: AuthProvider.LOCAL,
      });

      if (!user) {
        return done(null, false, { message: "Invalid email or password." });
      }

      // ✅ Step 2: Check Password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return done(null, false, { message: "Invalid email or password." });
      }

      // ✅ Step 3: Find Account with Role
      let account = await AccountModel.findOne({ user: user._id, role });

      if (!account && role === UserRole.CLIENT) {
        account = await AccountModel.create({
          user: user._id,
          role: UserRole.CLIENT,
          first_name: "User",
          last_name: "Unknown",
          preferences: {
            language: "pl",
            email_notifications: true,
            push_notifications: true,
          },
        });
      }

      if (!account) {
        // 🔍 No account found → Business setup required
        if (role === UserRole.BUSINESS) {
          return done(null, {
            user,
            businessSetupRequired: true,
          });
        }

        return done(null, false, {
          message: `No ${role} account found for this email.`,
        });
      }

      return done(null, { user, account });
    } catch (error) {
      console.error("❌ Signin Error:", error);
      return done(error, false);
    }
  }
);
/*
const localSigninStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (request: any, email: string, password: string, done: any) => {
    try {
      const { role } = request.body; // Role must be provided in request

      if (!role) {
        return done(null, false, { message: "Role is required for login" });
      }

      // 🔎 Find user by email
      let user = await FindUserByEmail(email);
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }

      // 🔎 Find user's account for the selected role
      const account = await FindAccountByUserIdAndRole(user._id, role);
      if (!account) {
        return done(null, false, { message: `No ${role} account found` });
      }

      // 🔐 Validate passwo
      const isPasswordValid = await (user as UserDocument).comparePassword(
        password
      );
      if (!isPasswordValid) {
        return done(null, false, { message: "Invalid email or password" });
      }

      // 🔑 Generate a JWT for the selected role
      const token = signJwt(user._id.toString(), account._id.toString(), role);

      // ✅ Return authentication response
      const response = {
        message: "Login successful",
        data: {
          token,
          account: {
            _id: account._id.toString(),
            role: account.role,
            first_name: account.first_name,
            last_name: account.last_name,
            avatar: account.avatar,
          },
        },
      };

      return done(null, response);
    } catch (error) {
      return done(error, false);
    }
  }
);
*/

export function createJwtStrategy(
  fastify: FastifyInstance
): JwtStrategy | null {
  const jwtSecret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  // In production, JWT secret is mandatory
  if (!jwtSecret && isProduction) {
    throw new AuthConfigError(
      "JWT_SECRET environment variable is required in production"
    );
  }

  // If no JWT secret and not in production, skip JWT strategy
  if (!jwtSecret && !isProduction) {
    fastify.log.warn(
      "JWT_SECRET not provided. JWT authentication will be disabled."
    );
    return null;
  }

  if (!jwtSecret) {
    return null; // TypeScript guard
  }
  return new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret as string,
      passReqToCallback: true,
    },
    async (req, jwtPayload, done) => {
      try {
        if (!jwtPayload.userId || !jwtPayload.accountId) {
          return done(
            new TokenError("Invalid token: Missing userId or accountId"),
            false
          );
        }

        const account = await AccountModel.findOne({
          _id: jwtPayload.accountId,
        });
        if (!account) {
          return done(
            new TokenError("Invalid token: Account not found"),
            false
          );
        }

        req.currentAccount = account;

        done(null, account);
      } catch (error) {
        req.log.error({ error }, "JWT strategy error");
        done(error, false);
      }
    }
  );
}

export async function registerPassport(fastify: FastifyInstance) {
  try {
    // Initialize Fastify Passport
    await fastify.register(fastifyPassport.initialize());

    fastify.log.info("Initializing authentication strategies");

    // Register Local Strategies
    //fastifyPassport.use("local-login", localLoginStrategy);
    fastifyPassport.use("local-signup", localSignupStrategy);
    fastifyPassport.use("local-signin", localSigninStrategy);

    const googleStrategy = createGoogleStrategy(fastify);
    if (googleStrategy) {
      fastifyPassport.use("google", googleStrategy);
      fastify.log.info("Google OAuth strategy registered");
    }

    // Conditionally register JWT strategy
    const jwtStrategy = createJwtStrategy(fastify);
    if (jwtStrategy) {
      fastifyPassport.use("jwt", jwtStrategy);
      fastify.log.info("JWT authentication strategy registered");
    }

    fastify.log.info("All authentication strategies registered successfully");
  } catch (error) {
    fastify.log.error({ error }, "Failed to register passport strategies");
    throw error;
  }
}

// In your passport configuration file:
export default fastifyPassport;
