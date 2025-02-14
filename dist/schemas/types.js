"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonTypes = void 0;
const typebox_1 = require("@sinclair/typebox");
const enums_1 = require("../types/enums");
exports.CommonTypes = {
    // MongoDB related
    ObjectId: typebox_1.Type.String({
        pattern: "^[0-9a-fA-F]{24}$",
        description: "MongoDB ObjectId",
    }),
    Email: typebox_1.Type.String({ format: "email" }),
    Password: typebox_1.Type.String({
        minLength: 8,
        pattern: '^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$',
        description: "Password must contain at least 8 characters, one number and one special character",
    }),
    URI: typebox_1.Type.String({ format: "uri" }),
    Phone: typebox_1.Type.String({
        pattern: "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$",
        description: "Phone number in international format",
    }),
    UserType: typebox_1.Type.Union([
        typebox_1.Type.Literal("client"),
        typebox_1.Type.Literal("business"),
        typebox_1.Type.Literal("admin"),
    ]),
    // Pagination
    PaginationQuery: typebox_1.Type.Object({
        page: typebox_1.Type.Optional(typebox_1.Type.Number({ minimum: 1 })),
        limit: typebox_1.Type.Optional(typebox_1.Type.Number({ minimum: 1, maximum: 100 })),
        sort: typebox_1.Type.Optional(typebox_1.Type.String()),
    }),
    PaginationResult: typebox_1.Type.Object({
        totalItems: typebox_1.Type.Number(),
        itemsPerPage: typebox_1.Type.Number(),
        totalPages: typebox_1.Type.Number(),
        currentPage: typebox_1.Type.Number(),
    }),
    // Common response structures
    SuccessResponse: typebox_1.Type.Object({
        message: typebox_1.Type.String(),
        success: typebox_1.Type.Boolean({ default: true }),
    }),
    ErrorResponse: typebox_1.Type.Object({
        message: typebox_1.Type.String(),
        error: typebox_1.Type.String(),
        statusCode: typebox_1.Type.Number(),
    }),
    // Common status types
    Status: typebox_1.Type.Union([
        typebox_1.Type.Literal("active"),
        typebox_1.Type.Literal("inactive"),
        typebox_1.Type.Literal("pending"),
        typebox_1.Type.Literal("blocked"),
        typebox_1.Type.Literal("deleted"),
        typebox_1.Type.Literal("pending_verification"),
    ]),
    // Date-time related
    DateRange: typebox_1.Type.Object({
        startDate: typebox_1.Type.String({ format: "date-time" }),
        endDate: typebox_1.Type.String({ format: "date-time" }),
    }),
    DataResponse: typebox_1.Type.Object({
        message: typebox_1.Type.String(),
        data: typebox_1.Type.Optional(typebox_1.Type.Any()),
    }),
    TokenResponse: typebox_1.Type.Object({
        message: typebox_1.Type.String(),
        token: typebox_1.Type.String(),
    }),
    RestaurantType: typebox_1.Type.Union([
        typebox_1.Type.Literal(enums_1.RestaurantType.VEGAN),
        typebox_1.Type.Literal(enums_1.RestaurantType.VEGETARIAN),
        typebox_1.Type.Literal(enums_1.RestaurantType.TRADITIONAL_WITH_VEGE), // Updated to match enum
    ]),
    CuisineType: typebox_1.Type.Union([
        typebox_1.Type.Literal(enums_1.CuisineType.POLISH),
        typebox_1.Type.Literal(enums_1.CuisineType.ITALIAN),
        typebox_1.Type.Literal(enums_1.CuisineType.ASIAN),
        typebox_1.Type.Literal(enums_1.CuisineType.FUSION),
        typebox_1.Type.Literal(enums_1.CuisineType.MEDITERRANEAN),
        typebox_1.Type.Literal(enums_1.CuisineType.INDIAN),
        typebox_1.Type.Literal(enums_1.CuisineType.AMERICAN),
        typebox_1.Type.Literal(enums_1.CuisineType.MEXICAN),
        typebox_1.Type.Literal(enums_1.CuisineType.JAPANESE),
        typebox_1.Type.Literal(enums_1.CuisineType.KOREAN),
        typebox_1.Type.Literal(enums_1.CuisineType.CHINESE),
        typebox_1.Type.Literal(enums_1.CuisineType.THAI),
        typebox_1.Type.Literal(enums_1.CuisineType.VIETNAMESE),
        typebox_1.Type.Literal(enums_1.CuisineType.MALAYSIAN),
    ]),
    OpeningHoursSchema: typebox_1.Type.Object({
        monday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
        tuesday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
        wednesday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
        thursday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
        friday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
        saturday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
        sunday: typebox_1.Type.Object({
            open: typebox_1.Type.String(),
            close: typebox_1.Type.String(),
            is_closed: typebox_1.Type.Boolean(),
        }),
    }),
    MealType: typebox_1.Type.Union([
        typebox_1.Type.Literal(enums_1.MealType.BREAKFAST),
        typebox_1.Type.Literal(enums_1.MealType.STARTER),
        typebox_1.Type.Literal(enums_1.MealType.SOUP),
        typebox_1.Type.Literal(enums_1.MealType.SALAD),
        typebox_1.Type.Literal(enums_1.MealType.MAIN),
        typebox_1.Type.Literal(enums_1.MealType.DESSERT),
        typebox_1.Type.Literal(enums_1.MealType.BEVERAGE),
        typebox_1.Type.Literal(enums_1.MealType.SNACK),
    ]),
};
