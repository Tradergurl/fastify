import { Types } from "mongoose";
import { RestaurantType, CuisineType, MealType } from "../types/enums";

export interface LocationDTO {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface AddressDTO {
  formatted_address: string;
  place_id: string;
  location: LocationDTO;
}

export interface ContactDTO {
  email: string;
  phone: string;
  website?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface ImagesDTO {
  main_image: string;
  gallery?: string[];
}

export interface RatingDTO {
  average?: number;
  count?: number;
}

export interface OpeningHoursDTO {
  monday?: { open: string; close: string; is_closed: boolean };
  tuesday?: { open: string; close: string; is_closed: boolean };
  wednesday?: { open: string; close: string; is_closed: boolean };
  thursday?: { open: string; close: string; is_closed: boolean };
  friday?: { open: string; close: string; is_closed: boolean };
  saturday?: { open: string; close: string; is_closed: boolean };
  sunday?: { open: string; close: string; is_closed: boolean };
}

export interface FeaturesDTO {
  wifi?: boolean;
  parking?: boolean;
  outdoor_seating?: boolean;
  delivery?: boolean;
  takeaway?: boolean;
  reservations?: boolean;
}

export interface StatusDTO {
  is_active?: boolean;
  is_verified?: boolean;
}

export interface CreateRestaurantDTO {
  owner: Types.ObjectId;
  name: string;
  description: string;
  address: AddressDTO;
  restaurant_types: RestaurantType[];
  cuisine_types: CuisineType[];
  contact: ContactDTO;
  images: ImagesDTO;
  opening_hours: OpeningHoursDTO;
  features?: FeaturesDTO;
  status?: StatusDTO;
}

export type UpdateRestaurantDTO = {
  name?: string;
  description?: string;
  address?: Partial<AddressDTO>;
  restaurant_types?: RestaurantType[];
  cuisine_types?: CuisineType[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    social_media?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  images?: {
    main_image?: string;
    gallery?: string[];
  };
  opening_hours?: Partial<OpeningHoursDTO>;
  features?: Partial<FeaturesDTO>;
};

export interface GetRestaurantsQuery {
  page?: number;
  limit?: number;
  city?: string;
  restaurant_type?: string;
  cuisine_type?: string;
  sortBy?: "top_rated" | "recommended" | "most_popular";
}

export interface CreateMealDTO {
  name: string;
  description?: string;
  image?: string;
  price: number;
  ingredients: string[];
  allergens?: string[];
  is_vegan: boolean;
  type: MealType;
  is_active: boolean; // ✅ Single field for meal status
}

export interface UpdateMealDTO {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  ingredients?: string[];
  allergens?: string[];
  is_vegan?: boolean;
  type?: MealType;
  is_active?: boolean;
  updatedAt?: Date;
}

export interface Meal {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  price: number;
  ingredients: string[];
  allergens?: string[];
  is_vegan: boolean;
  type: MealType;
  is_active: boolean;
  updatedAt?: Date;
  createdAt?: Date;
}
