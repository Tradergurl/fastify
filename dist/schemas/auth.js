"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouteSchemas = void 0;
const typebox_1 = require("@sinclair/typebox");
const types_1 = require("./types");
exports.AuthRouteSchemas = {
    body: {
        clientSignup: typebox_1.Type.Object({
            email: types_1.CommonTypes.Email,
            password: types_1.CommonTypes.Password,
            first_name: typebox_1.Type.String({ minLength: 2 }),
            last_name: typebox_1.Type.String({ minLength: 2 }),
            phone: typebox_1.Type.Optional(typebox_1.Type.String()),
            role: typebox_1.Type.Literal("client"), // ✅ Ensures correct role
            terms_accepted: typebox_1.Type.Boolean(),
            marketing_consent: typebox_1.Type.Boolean(),
        }),
        businessSignup: typebox_1.Type.Object({
            email: types_1.CommonTypes.Email,
            password: types_1.CommonTypes.Password,
            first_name: typebox_1.Type.String({ minLength: 2 }),
            last_name: typebox_1.Type.String({ minLength: 2 }),
            phone: typebox_1.Type.Optional(typebox_1.Type.String()),
            role: typebox_1.Type.Literal("business"), // ✅ Ensures correct role
            business_details: typebox_1.Type.Optional(typebox_1.Type.Object({
                company_name: typebox_1.Type.String(),
                tax_id: typebox_1.Type.String(),
                address: typebox_1.Type.String(),
                logo: typebox_1.Type.Optional(typebox_1.Type.String()),
            })),
            terms_accepted: typebox_1.Type.Boolean(),
            marketing_consent: typebox_1.Type.Boolean(),
        }),
        signin: typebox_1.Type.Object({
            email: types_1.CommonTypes.Email,
            password: types_1.CommonTypes.Password,
            role: types_1.CommonTypes.UserType, // ✅ Ensure role is passed during login
        }),
    },
    response: {
        signup: {
            201: typebox_1.Type.Object({
                message: typebox_1.Type.String(),
                data: typebox_1.Type.Object({
                    token: typebox_1.Type.String(),
                    account: typebox_1.Type.Object({
                        _id: types_1.CommonTypes.ObjectId,
                        user: typebox_1.Type.Object({
                            _id: types_1.CommonTypes.ObjectId,
                            email: types_1.CommonTypes.Email,
                            status: types_1.CommonTypes.Status,
                        }),
                        role: types_1.CommonTypes.UserType,
                        first_name: typebox_1.Type.String(),
                        last_name: typebox_1.Type.String(),
                        avatar: typebox_1.Type.Optional(typebox_1.Type.String()),
                    }),
                }),
            }),
            400: types_1.CommonTypes.ErrorResponse,
        },
        signin: {
            200: typebox_1.Type.Object({
                message: typebox_1.Type.String(),
                data: typebox_1.Type.Object({
                    token: typebox_1.Type.String(),
                    account: typebox_1.Type.Object({
                        _id: types_1.CommonTypes.ObjectId,
                        user: typebox_1.Type.Object({
                            _id: types_1.CommonTypes.ObjectId,
                            email: types_1.CommonTypes.Email,
                            status: types_1.CommonTypes.Status,
                        }),
                        role: types_1.CommonTypes.UserType,
                        first_name: typebox_1.Type.String(),
                        last_name: typebox_1.Type.String(),
                        avatar: typebox_1.Type.Optional(typebox_1.Type.String()),
                    }),
                    businessSetup: typebox_1.Type.Optional(typebox_1.Type.Object({
                        required: typebox_1.Type.Boolean(),
                        missingFields: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String())),
                    })), // ✅ Added businessSetup status
                }),
            }),
            401: types_1.CommonTypes.ErrorResponse,
        },
    },
};
