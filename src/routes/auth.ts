import { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { AuthRouteSchemas } from "../schemas/auth";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { AuthenticationError } from "../types/errors";
import { createAuthResponse } from "../utils/authResponse";
import { UserDocument, UserModel } from "../models/user.model";
import { AccountModel, AccountDocument } from "../models/account.model";
import { UserRole } from "../types/enums";
import { Types } from "mongoose";
import { signUpBusiness, SignUpRequest } from "../controllers/authController";
import { BadRequestError } from "../types/errors";
export default async function authRoutes(fastify: FastifyInstance) {
  /*
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/business/signup",
    schema: AuthRouteSchemas.businessSignup,
    preValidation: fastifyPassport.authenticate("local-signup", {
      session: false,
    }),
    handler: async (request, reply) => {
      try {
        const user = request.user as UserDocument;
        const account = await AccountModel.findOne({
          user: user._id,
          role: UserRole.BUSINESS,
        });

        if (!user || !account) {
          throw new AuthenticationError("Failed to create account");
        }

        const response = createAuthResponse(
          account,
          user,
          "Account created successfully"
        );

        return reply.status(201).send(response);
      } catch (error) {
        request.log.error(error, "Registration failed");
        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/client/signup",
    schema: AuthRouteSchemas.clientSignup,
    preValidation: fastifyPassport.authenticate("local-signup", {
      session: false,
    }),
    handler: async (request, reply) => {
      // ✅ Log user ID before searching for the account
      try {
        const user = request.user as UserDocument & {
          account?: AccountDocument;
        };

        // 🔍 Ensure user exists
        if (!user) {
          throw new AuthenticationError("User not found after signup");
        }

        console.log("🔑 User in Route Handler:", user);

        // ✅ Ensure the account exists
        if (!user.account) {
          throw new AuthenticationError("Failed to retrieve user account");
        }

        console.log("🔍 Found Account in Handler:", user.account);

        // ✅ Generate auth response
        const response = createAuthResponse(
          user.account,
          user,
          "Account created successfully"
        );

        return reply.status(201).send(response);
      } catch (error) {
        request.log.error(error, "Registration failed");
        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/business/signin",
    schema: AuthRouteSchemas.signin, // Ensure you have this schema
    preValidation: fastifyPassport.authenticate("local-signin", {
      session: false,
    }),
    handler: async (request, reply) => {
      try {
        const user = request.user as UserDocument;
        const account = await AccountModel.findOne({
          user: user._id,
          role: UserRole.BUSINESS,
        });

        if (!user || !account) {
          throw new AuthenticationError("Invalid email or password");
        }

        const response = createAuthResponse(account, user, "Login successful");

        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error, "Login failed");
        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/client/signin",
    schema: AuthRouteSchemas.signin, // Ensure you have this schema
    preValidation: fastifyPassport.authenticate("local-signin", {
      session: false,
    }),
    handler: async (request, reply) => {
      try {
        const user = request.user as UserDocument;
        const account = await AccountModel.findOne({
          user: user._id,
          role: UserRole.CLIENT,
        });

        if (!user || !account) {
          throw new AuthenticationError("Invalid email or password");
        }

        const response = createAuthResponse(account, user, "Login successful");

        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error, "Login failed");
        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });
  */

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/business/signup",
    //schema: AuthRouteSchemas.body.businessSignup,
    //preValidation: fastifyPassport.authenticate("local-signup", {
    //  session: false,
    //})
    handler: async (request, reply) => {
      const user = await signUpBusiness(request.body as SignUpRequest);

      if (!user) {
        throw new BadRequestError(
          "Signup failed. Please check your input and try again."
        );
      }

      return reply.status(201).send({
        message: "Account created successfully.",
        data: user,
      });
    },
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/client/signup",
    schema: AuthRouteSchemas.body.clientSignup,
    preValidation: fastifyPassport.authenticate("local-signup", {
      session: false,
    }),
    handler: async (request, reply) => {
      try {
        const user = request.user as UserDocument;

        // ✅ Check if account exists for this user & role
        let account = await AccountModel.findOne({
          user: user._id,
          role: UserRole.CLIENT,
        });

        if (!account) {
          throw new AuthenticationError("Account creation failed");
        }

        console.log("🔍 Found Account in Handler:", account);

        // ✅ Generate auth response
        const response = createAuthResponse(
          account,
          user,
          "Account created successfully"
        );
        return reply.status(201).send(response);
      } catch (error) {
        request.log.error(error, "Registration failed");
        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });
  fastify.get("/auth/verify-email", async (request, reply) => {
    try {
      const { token } = request.query as { token: string };

      const user = await UserModel.findOne({
        email_verification_token: token,
        email_verification_expires: { $gt: new Date() }, // Ensure token is still valid
      });

      if (!user) {
        return reply.status(400).send({ message: "Invalid or expired token" });
      }

      // ✅ Mark user as verified
      user.is_email_verified = true;
      user.verification_data.verified = true;

      await user.save();

      return reply.send({
        message: "Email verified successfully. You can now log in.",
      });
    } catch (error) {
      reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/business/signin",
    schema: AuthRouteSchemas.body.signin,
    preValidation: fastifyPassport.authenticate("local-signin", {
      session: false,
    }),
    handler: async (request, reply) => {
      try {
        const { user, account, businessSetupRequired } = request.user as {
          user: UserDocument;
          account?: AccountDocument;
          businessSetupRequired?: boolean;
        };

        if (!user) {
          throw new AuthenticationError("Invalid email or password");
        }

        // ✅ If business setup is required, return a special response
        if (!account && businessSetupRequired) {
          return reply.status(200).send({
            message: "Business setup required before signing in.",
            data: {
              businessSetupRequired: true,
              userId: user._id.toString(),
              email: user.email,
              setupUrl: "https://yourapp.com/business/setup", // Redirect user
            },
          });
        }

        if (!account) {
          throw new AuthenticationError(
            `No ${(request.body as any).role} account found.`
          );
        }

        // ✅ Generate JWT and send response
        const response = createAuthResponse(
          account,
          user,
          "Login successful",
          true
        );

        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error, "❌ Login failed");

        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/client/signin",
    schema: AuthRouteSchemas.body.signin, // Ensure you have this schema
    preValidation: fastifyPassport.authenticate("local-signin", {
      session: false,
    }),
    handler: async (request, reply) => {
      try {
        const { user, account } = request.user as {
          user: UserDocument;
          account: AccountDocument;
        };

        console.log("🔍 Found Account in Handler:", account);

        if (!user) {
          throw new AuthenticationError("Invalid email or password");
        }
        if (!account) {
          throw new AuthenticationError(
            `No ${(request.body as any).role} account found.`
          );
        }

        // ✅ Generate JWT and send response
        const response = createAuthResponse(
          account,
          user,
          "Login successful",
          true
        );

        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error, "❌ Login failed");

        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            message: error.message,
            error: error.code,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
    },
  });

  fastify.route({
    method: "GET",
    url: "/client/auth/google",
    preValidation: fastifyPassport.authenticate("google", { session: false }),
    handler: async (request, reply) => {},
  });
  fastify.route({
    method: "GET",
    url: "/client/auth/google/callback",
    preValidation: fastifyPassport.authenticate("google", { session: false }),
    handler: async (request, reply) => {
      try {
        const response = request.user; // Already formatted by `createAuthResponse`
        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error, "Google authentication failed");
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    },
  });
  fastify.route({
    method: "GET",
    url: "/business/auth/google",
    preValidation: fastifyPassport.authenticate("google", { session: false }),
    handler: async (request, reply) => {},
  });
  fastify.route({
    method: "GET",
    url: "/business/auth/google/callback",
    preValidation: fastifyPassport.authenticate("google", { session: false }),
    handler: async (request, reply) => {
      try {
        const response = request.user; // Already formatted by `createAuthResponse`
        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error, "Google authentication failed");
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    },
  });
}
