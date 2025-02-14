import { Type } from "@sinclair/typebox";
import { CommonTypes } from "./types";

export const OpeningHoursSchema = Type.Object({
  monday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
  tuesday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
  wednesday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
  thursday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
  friday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
  saturday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
  sunday: Type.Optional(
    Type.Object({
      open: Type.String(),
      close: Type.String(),
      is_closed: Type.Boolean(),
    })
  ),
});

export const RestaurantSchemas = {
  body: {
    createRestaurant: Type.Object({
      name: Type.String({ minLength: 3 }),
      description: Type.String({ minLength: 10 }),
      address: Type.Object({
        formatted_address: Type.String(),
        place_id: Type.String(),
        location: Type.Object({
          type: Type.Literal("Point"),
          coordinates: Type.Tuple([Type.Number(), Type.Number()]), // [longitude, latitude]
        }),
      }),
      restaurant_types: Type.Array(CommonTypes.RestaurantType),
      cuisine_types: Type.Array(CommonTypes.CuisineType),
      contact: Type.Object({
        email: CommonTypes.Email,
        phone: Type.String(),
        website: Type.Optional(Type.String()),
        social_media: Type.Optional(
          Type.Object({
            facebook: Type.Optional(Type.String()),
            instagram: Type.Optional(Type.String()),
            twitter: Type.Optional(Type.String()),
          })
        ),
      }),
      images: Type.Object({
        main_image: Type.String(),
        gallery: Type.Optional(Type.Array(Type.String())),
      }),
      opening_hours: OpeningHoursSchema,
      features: Type.Object({
        wifi: Type.Boolean(),
        parking: Type.Boolean(),
        outdoor_seating: Type.Boolean(),
        delivery: Type.Boolean(),
        takeaway: Type.Boolean(),
        reservations: Type.Boolean(),
      }),
    }),
  },

  response: {
    createRestaurant: {
      201: Type.Object({
        message: Type.String(),
        data: Type.Object({
          _id: CommonTypes.ObjectId,
          owner: CommonTypes.ObjectId, // ✅ Owner (Business Account ID)
          name: Type.String(),
          address: Type.Object({
            formatted_address: Type.String(),
            location: Type.Object({
              type: Type.Literal("Point"),
              coordinates: Type.Tuple([Type.Number(), Type.Number()]),
            }),
          }),
          rating: Type.Object({
            average: Type.Number(),
            count: Type.Number(),
          }),
          restaurant_types: Type.Array(CommonTypes.RestaurantType),
          cuisine_types: Type.Array(CommonTypes.CuisineType),
          contact: Type.Object({
            email: CommonTypes.Email,
            phone: Type.String(),
            website: Type.Optional(Type.String()),
          }),
          images: Type.Object({
            main_image: Type.String(),
          }),
          status: Type.Object({
            is_active: Type.Boolean(),
            is_verified: Type.Boolean(),
          }),
        }),
      }),
      400: CommonTypes.ErrorResponse,
    },
  },
};
