"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantSchemas = exports.OpeningHoursSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const types_1 = require("./types");
exports.OpeningHoursSchema = typebox_1.Type.Object({
    monday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
    tuesday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
    wednesday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
    thursday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
    friday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
    saturday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
    sunday: typebox_1.Type.Optional(typebox_1.Type.Object({
        open: typebox_1.Type.String(),
        close: typebox_1.Type.String(),
        is_closed: typebox_1.Type.Boolean(),
    })),
});
exports.RestaurantSchemas = {
    body: {
        createRestaurant: typebox_1.Type.Object({
            name: typebox_1.Type.String({ minLength: 3 }),
            description: typebox_1.Type.String({ minLength: 10 }),
            address: typebox_1.Type.Object({
                formatted_address: typebox_1.Type.String(),
                place_id: typebox_1.Type.String(),
                location: typebox_1.Type.Object({
                    type: typebox_1.Type.Literal("Point"),
                    coordinates: typebox_1.Type.Tuple([typebox_1.Type.Number(), typebox_1.Type.Number()]), // [longitude, latitude]
                }),
            }),
            restaurant_types: typebox_1.Type.Array(types_1.CommonTypes.RestaurantType),
            cuisine_types: typebox_1.Type.Array(types_1.CommonTypes.CuisineType),
            contact: typebox_1.Type.Object({
                email: types_1.CommonTypes.Email,
                phone: typebox_1.Type.String(),
                website: typebox_1.Type.Optional(typebox_1.Type.String()),
                social_media: typebox_1.Type.Optional(typebox_1.Type.Object({
                    facebook: typebox_1.Type.Optional(typebox_1.Type.String()),
                    instagram: typebox_1.Type.Optional(typebox_1.Type.String()),
                    twitter: typebox_1.Type.Optional(typebox_1.Type.String()),
                })),
            }),
            images: typebox_1.Type.Object({
                main_image: typebox_1.Type.String(),
                gallery: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String())),
            }),
            opening_hours: exports.OpeningHoursSchema,
            features: typebox_1.Type.Object({
                wifi: typebox_1.Type.Boolean(),
                parking: typebox_1.Type.Boolean(),
                outdoor_seating: typebox_1.Type.Boolean(),
                delivery: typebox_1.Type.Boolean(),
                takeaway: typebox_1.Type.Boolean(),
                reservations: typebox_1.Type.Boolean(),
            }),
        }),
    },
    response: {
        createRestaurant: {
            201: typebox_1.Type.Object({
                message: typebox_1.Type.String(),
                data: typebox_1.Type.Object({
                    _id: types_1.CommonTypes.ObjectId,
                    owner: types_1.CommonTypes.ObjectId, // ✅ Owner (Business Account ID)
                    name: typebox_1.Type.String(),
                    address: typebox_1.Type.Object({
                        formatted_address: typebox_1.Type.String(),
                        location: typebox_1.Type.Object({
                            type: typebox_1.Type.Literal("Point"),
                            coordinates: typebox_1.Type.Tuple([typebox_1.Type.Number(), typebox_1.Type.Number()]),
                        }),
                    }),
                    rating: typebox_1.Type.Object({
                        average: typebox_1.Type.Number(),
                        count: typebox_1.Type.Number(),
                    }),
                    restaurant_types: typebox_1.Type.Array(types_1.CommonTypes.RestaurantType),
                    cuisine_types: typebox_1.Type.Array(types_1.CommonTypes.CuisineType),
                    contact: typebox_1.Type.Object({
                        email: types_1.CommonTypes.Email,
                        phone: typebox_1.Type.String(),
                        website: typebox_1.Type.Optional(typebox_1.Type.String()),
                    }),
                    images: typebox_1.Type.Object({
                        main_image: typebox_1.Type.String(),
                    }),
                    status: typebox_1.Type.Object({
                        is_active: typebox_1.Type.Boolean(),
                        is_verified: typebox_1.Type.Boolean(),
                    }),
                }),
            }),
            400: types_1.CommonTypes.ErrorResponse,
        },
    },
};
