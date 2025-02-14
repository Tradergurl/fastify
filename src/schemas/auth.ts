import { Type } from "@sinclair/typebox";
import { CommonTypes } from "./types";

export const AuthRouteSchemas = {
  body: {
    clientSignup: Type.Object({
      email: CommonTypes.Email,
      password: CommonTypes.Password,
      first_name: Type.String({ minLength: 2 }),
      last_name: Type.String({ minLength: 2 }),
      phone: Type.Optional(Type.String()),
      role: Type.Literal("client"), // ✅ Ensures correct role
      terms_accepted: Type.Boolean(),
      marketing_consent: Type.Boolean(),
    }),

    businessSignup: Type.Object({
      email: CommonTypes.Email,
      password: CommonTypes.Password,
      first_name: Type.String({ minLength: 2 }),
      last_name: Type.String({ minLength: 2 }),
      phone: Type.Optional(Type.String()),
      role: Type.Literal("business"), // ✅ Ensures correct role
      business_details: Type.Optional(
        Type.Object({
          company_name: Type.String(),
          tax_id: Type.String(),
          address: Type.String(),
          logo: Type.Optional(Type.String()),
        })
      ),
      terms_accepted: Type.Boolean(),
      marketing_consent: Type.Boolean(),
    }),

    signin: Type.Object({
      email: CommonTypes.Email,
      password: CommonTypes.Password,
      role: CommonTypes.UserType, // ✅ Ensure role is passed during login
    }),
  },

  response: {
    signup: {
      201: Type.Object({
        message: Type.String(),
        data: Type.Object({
          token: Type.String(),
          account: Type.Object({
            _id: CommonTypes.ObjectId,
            user: Type.Object({
              _id: CommonTypes.ObjectId,
              email: CommonTypes.Email,
              status: CommonTypes.Status,
            }),
            role: CommonTypes.UserType,
            first_name: Type.String(),
            last_name: Type.String(),
            avatar: Type.Optional(Type.String()),
          }),
        }),
      }),
      400: CommonTypes.ErrorResponse,
    },

    signin: {
      200: Type.Object({
        message: Type.String(),
        data: Type.Object({
          token: Type.String(),
          account: Type.Object({
            _id: CommonTypes.ObjectId,
            user: Type.Object({
              _id: CommonTypes.ObjectId,
              email: CommonTypes.Email,
              status: CommonTypes.Status,
            }),
            role: CommonTypes.UserType,
            first_name: Type.String(),
            last_name: Type.String(),
            avatar: Type.Optional(Type.String()),
          }),
          businessSetup: Type.Optional(
            Type.Object({
              required: Type.Boolean(),
              missingFields: Type.Optional(Type.Array(Type.String())),
            })
          ), // ✅ Added businessSetup status
        }),
      }),
      401: CommonTypes.ErrorResponse,
    },
  },
};
