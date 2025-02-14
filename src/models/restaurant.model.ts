// restaurant.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { RestaurantType, CuisineType, MealType } from "../types/enums";

interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

interface Address {
  formatted_address: string;
  place_id: string;
  location: Location;
}

interface MealDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  ingredients: string[];
  allergens: string[];
  is_vegan: boolean;
  type: MealType;
  likes: number;
  is_active: boolean;
}

interface ReviewDocument extends Document {
  user_id: Types.ObjectId;
  user_name: string;
  rating: number;
  comment: string;
  created_at: Date;
}

export interface RestaurantDocument extends Document {
  owner: Types.ObjectId;
  name: string;
  description: string;
  address: Address;
  restaurant_types: RestaurantType[];
  cuisine_types: CuisineType[];
  contact: {
    email: string;
    phone: string;
    website?: string;
    social_media?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  images: {
    main_image: string;
    gallery: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  opening_hours: {
    monday: { open: string; close: string; is_closed: boolean };
    tuesday: { open: string; close: string; is_closed: boolean };
    wednesday: { open: string; close: string; is_closed: boolean };
    thursday: { open: string; close: string; is_closed: boolean };
    friday: { open: string; close: string; is_closed: boolean };
    saturday: { open: string; close: string; is_closed: boolean };
    sunday: { open: string; close: string; is_closed: boolean };
  };
  features: {
    wifi: boolean;
    parking: boolean;
    outdoor_seating: boolean;
    delivery: boolean;
    takeaway: boolean;
    reservations: boolean;
  };
  status: {
    is_active: boolean;
    is_verified: boolean;
  };
  meals: MealDocument[];
  recent_reviews: ReviewDocument[];
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    formatted_address: {
      type: String,
      required: true,
    },
    place_id: {
      type: String,
      required: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
  },
  { _id: false }
);

// ✅ Meal Subdocument (Embedded)
const mealSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    price: { type: Number, required: true },
    ingredients: { type: [String] },
    allergens: { type: [String] },
    is_vegan: { type: Boolean, default: false },
    type: {
      type: String,
      enum: Object.values(MealType),
      required: true,
    },
    likes: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const restaurantSchema = new Schema<RestaurantDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: addressSchema,
    restaurant_types: [
      {
        type: String,
        enum: Object.values(RestaurantType),
        required: true,
      },
    ],
    cuisine_types: [
      {
        type: String,
        enum: Object.values(CuisineType),
        required: true,
      },
    ],
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      website: String,
      social_media: {
        facebook: String,
        instagram: String,
        twitter: String,
      },
    },
    images: {
      main_image: { type: String, required: true },
      gallery: [String],
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    opening_hours: {
      monday: { open: String, close: String, is_closed: Boolean },
      tuesday: { open: String, close: String, is_closed: Boolean },
      wednesday: { open: String, close: String, is_closed: Boolean },
      thursday: { open: String, close: String, is_closed: Boolean },
      friday: { open: String, close: String, is_closed: Boolean },
      saturday: { open: String, close: String, is_closed: Boolean },
      sunday: { open: String, close: String, is_closed: Boolean },
    },
    features: {
      wifi: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      outdoor_seating: { type: Boolean, default: false },
      delivery: { type: Boolean, default: false },
      takeaway: { type: Boolean, default: false },
      reservations: { type: Boolean, default: false },
    },
    status: {
      is_active: { type: Boolean, default: true },
      is_verified: { type: Boolean, default: false },
    },
    meals: [mealSchema],
    recent_reviews: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: "User" },
        user_name: { type: String },
        user_image: { type: String },
        rating: { type: Number, required: true },
        content: { type: String },
        created_at: { type: Date, default: Date.now },
      },
    ],
    is_deleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

restaurantSchema.index({ name: 1 });
restaurantSchema.index({ "address.city": 1 });
restaurantSchema.index({ restaurant_types: 1 });
restaurantSchema.index({ cuisine_types: 1 });
restaurantSchema.index({ "rating.average": -1 });

export const RestaurantModel = model<RestaurantDocument>(
  "Restaurant",
  restaurantSchema
);
