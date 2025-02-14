"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantModel = void 0;
// restaurant.model.ts
const mongoose_1 = require("mongoose");
const enums_1 = require("../types/enums");
const locationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
}, { _id: false });
const addressSchema = new mongoose_1.Schema({
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
}, { _id: false });
// ✅ Meal Subdocument (Embedded)
const mealSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    price: { type: Number, required: true },
    ingredients: { type: [String] },
    allergens: { type: [String] },
    is_vegan: { type: Boolean, default: false },
    type: {
        type: String,
        enum: Object.values(enums_1.MealType),
        required: true,
    },
    likes: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
const restaurantSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            enum: Object.values(enums_1.RestaurantType),
            required: true,
        },
    ],
    cuisine_types: [
        {
            type: String,
            enum: Object.values(enums_1.CuisineType),
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
            user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            user_name: { type: String },
            user_image: { type: String },
            rating: { type: Number, required: true },
            content: { type: String },
            created_at: { type: Date, default: Date.now },
        },
    ],
    is_deleted: { type: Boolean, default: false, required: true },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ "address.city": 1 });
restaurantSchema.index({ restaurant_types: 1 });
restaurantSchema.index({ cuisine_types: 1 });
restaurantSchema.index({ "rating.average": -1 });
exports.RestaurantModel = (0, mongoose_1.model)("Restaurant", restaurantSchema);
