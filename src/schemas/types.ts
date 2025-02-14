import { Type } from "@sinclair/typebox";
import { RestaurantType, CuisineType, MealType } from "../types/enums";
export const CommonTypes = {
  // MongoDB related
  ObjectId: Type.String({
    pattern: "^[0-9a-fA-F]{24}$",
    description: "MongoDB ObjectId",
  }),

  Email: Type.String({ format: "email" }),

  Password: Type.String({
    minLength: 8,
    pattern: '^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$',
    description:
      "Password must contain at least 8 characters, one number and one special character",
  }),

  URI: Type.String({ format: "uri" }),

  Phone: Type.String({
    pattern: "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$",
    description: "Phone number in international format",
  }),

  UserType: Type.Union([
    Type.Literal("client"),
    Type.Literal("business"),
    Type.Literal("admin"),
  ]),

  // Pagination
  PaginationQuery: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    sort: Type.Optional(Type.String()),
  }),

  PaginationResult: Type.Object({
    totalItems: Type.Number(),
    itemsPerPage: Type.Number(),
    totalPages: Type.Number(),
    currentPage: Type.Number(),
  }),

  // Common response structures
  SuccessResponse: Type.Object({
    message: Type.String(),
    success: Type.Boolean({ default: true }),
  }),

  ErrorResponse: Type.Object({
    message: Type.String(),
    error: Type.String(),
    statusCode: Type.Number(),
  }),

  // Common status types
  Status: Type.Union([
    Type.Literal("active"),
    Type.Literal("inactive"),
    Type.Literal("pending"),
    Type.Literal("blocked"),
    Type.Literal("deleted"),
    Type.Literal("pending_verification"),
  ]),

  // Date-time related
  DateRange: Type.Object({
    startDate: Type.String({ format: "date-time" }),
    endDate: Type.String({ format: "date-time" }),
  }),

  DataResponse: Type.Object({
    message: Type.String(),
    data: Type.Optional(Type.Any()),
  }),

  TokenResponse: Type.Object({
    message: Type.String(),
    token: Type.String(),
  }),
  RestaurantType: Type.Union([
    Type.Literal(RestaurantType.VEGAN),
    Type.Literal(RestaurantType.VEGETARIAN),
    Type.Literal(RestaurantType.TRADITIONAL_WITH_VEGE), // Updated to match enum
  ]),

  CuisineType: Type.Union([
    Type.Literal(CuisineType.POLISH),
    Type.Literal(CuisineType.ITALIAN),
    Type.Literal(CuisineType.ASIAN),
    Type.Literal(CuisineType.FUSION),
    Type.Literal(CuisineType.MEDITERRANEAN),
    Type.Literal(CuisineType.INDIAN),
    Type.Literal(CuisineType.AMERICAN),
    Type.Literal(CuisineType.MEXICAN),
    Type.Literal(CuisineType.JAPANESE),
    Type.Literal(CuisineType.KOREAN),
    Type.Literal(CuisineType.CHINESE),
    Type.Literal(CuisineType.THAI),
    Type.Literal(CuisineType.VIETNAMESE),
    Type.Literal(CuisineType.MALAYSIAN),
  ]),

  OpeningHoursSchema: Type.Object({
    monday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
    tuesday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
    wednesday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
    thursday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
    friday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
    saturday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
    sunday: Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    }),
  }),

  MealType: Type.Union([
    Type.Literal(MealType.BREAKFAST),
    Type.Literal(MealType.STARTER),
    Type.Literal(MealType.SOUP),
    Type.Literal(MealType.SALAD),
    Type.Literal(MealType.MAIN),
    Type.Literal(MealType.DESSERT),
    Type.Literal(MealType.BEVERAGE),
    Type.Literal(MealType.SNACK),
  ]),
};
