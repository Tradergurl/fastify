"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const passport_1 = __importDefault(require("@fastify/passport"));
const auth_1 = require("../schemas/auth");
const errors_1 = require("../types/errors");
const authResponse_1 = require("../utils/authResponse");
const user_model_1 = require("../models/user.model");
const account_model_1 = require("../models/account.model");
const enums_1 = require("../types/enums");
const authController_1 = require("../controllers/authController");
const errors_2 = require("../types/errors");
function authRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
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
        fastify.withTypeProvider().route({
            method: "POST",
            url: "/business/signup",
            //schema: AuthRouteSchemas.body.businessSignup,
            //preValidation: fastifyPassport.authenticate("local-signup", {
            //  session: false,
            //})
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                const user = yield (0, authController_1.signUpBusiness)(request.body);
                if (!user) {
                    throw new errors_2.BadRequestError("Signup failed. Please check your input and try again.");
                }
                return reply.status(201).send({
                    message: "Account created successfully.",
                    data: user,
                });
            }),
        });
        fastify.withTypeProvider().route({
            method: "POST",
            url: "/client/signup",
            schema: auth_1.AuthRouteSchemas.body.clientSignup,
            preValidation: passport_1.default.authenticate("local-signup", {
                session: false,
            }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const user = request.user;
                    // ✅ Check if account exists for this user & role
                    let account = yield account_model_1.AccountModel.findOne({
                        user: user._id,
                        role: enums_1.UserRole.CLIENT,
                    });
                    if (!account) {
                        throw new errors_1.AuthenticationError("Account creation failed");
                    }
                    console.log("🔍 Found Account in Handler:", account);
                    // ✅ Generate auth response
                    const response = (0, authResponse_1.createAuthResponse)(account, user, "Account created successfully");
                    return reply.status(201).send(response);
                }
                catch (error) {
                    request.log.error(error, "Registration failed");
                    if (error instanceof errors_1.AuthenticationError) {
                        return reply.status(401).send({
                            message: error.message,
                            error: error.code,
                            statusCode: error.statusCode,
                        });
                    }
                    throw error;
                }
            }),
        });
        fastify.get("/auth/verify-email", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = request.query;
                const user = yield user_model_1.UserModel.findOne({
                    email_verification_token: token,
                    email_verification_expires: { $gt: new Date() }, // Ensure token is still valid
                });
                if (!user) {
                    return reply.status(400).send({ message: "Invalid or expired token" });
                }
                // ✅ Mark user as verified
                user.is_email_verified = true;
                user.verification_data.verified = true;
                yield user.save();
                return reply.send({
                    message: "Email verified successfully. You can now log in.",
                });
            }
            catch (error) {
                reply.status(500).send({ message: "Internal Server Error" });
            }
        }));
        fastify.withTypeProvider().route({
            method: "POST",
            url: "/business/signin",
            schema: auth_1.AuthRouteSchemas.body.signin,
            preValidation: passport_1.default.authenticate("local-signin", {
                session: false,
            }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { user, account, businessSetupRequired } = request.user;
                    if (!user) {
                        throw new errors_1.AuthenticationError("Invalid email or password");
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
                        throw new errors_1.AuthenticationError(`No ${request.body.role} account found.`);
                    }
                    // ✅ Generate JWT and send response
                    const response = (0, authResponse_1.createAuthResponse)(account, user, "Login successful", true);
                    return reply.status(200).send(response);
                }
                catch (error) {
                    request.log.error(error, "❌ Login failed");
                    if (error instanceof errors_1.AuthenticationError) {
                        return reply.status(401).send({
                            message: error.message,
                            error: error.code,
                            statusCode: error.statusCode,
                        });
                    }
                    throw error;
                }
            }),
        });
        fastify.withTypeProvider().route({
            method: "POST",
            url: "/client/signin",
            schema: auth_1.AuthRouteSchemas.body.signin, // Ensure you have this schema
            preValidation: passport_1.default.authenticate("local-signin", {
                session: false,
            }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { user, account } = request.user;
                    console.log("🔍 Found Account in Handler:", account);
                    if (!user) {
                        throw new errors_1.AuthenticationError("Invalid email or password");
                    }
                    if (!account) {
                        throw new errors_1.AuthenticationError(`No ${request.body.role} account found.`);
                    }
                    // ✅ Generate JWT and send response
                    const response = (0, authResponse_1.createAuthResponse)(account, user, "Login successful", true);
                    return reply.status(200).send(response);
                }
                catch (error) {
                    request.log.error(error, "❌ Login failed");
                    if (error instanceof errors_1.AuthenticationError) {
                        return reply.status(401).send({
                            message: error.message,
                            error: error.code,
                            statusCode: error.statusCode,
                        });
                    }
                    throw error;
                }
            }),
        });
        fastify.route({
            method: "GET",
            url: "/client/auth/google",
            preValidation: passport_1.default.authenticate("google", { session: false }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () { }),
        });
        fastify.route({
            method: "GET",
            url: "/client/auth/google/callback",
            preValidation: passport_1.default.authenticate("google", { session: false }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = request.user; // Already formatted by `createAuthResponse`
                    return reply.status(200).send(response);
                }
                catch (error) {
                    request.log.error(error, "Google authentication failed");
                    return reply.status(500).send({ message: "Internal Server Error" });
                }
            }),
        });
        fastify.route({
            method: "GET",
            url: "/business/auth/google",
            preValidation: passport_1.default.authenticate("google", { session: false }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () { }),
        });
        fastify.route({
            method: "GET",
            url: "/business/auth/google/callback",
            preValidation: passport_1.default.authenticate("google", { session: false }),
            handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = request.user; // Already formatted by `createAuthResponse`
                    return reply.status(200).send(response);
                }
                catch (error) {
                    request.log.error(error, "Google authentication failed");
                    return reply.status(500).send({ message: "Internal Server Error" });
                }
            }),
        });
    });
}
