// models/review.model.ts
import { Schema, model, Document, Types } from "mongoose";

interface ReviewDocument extends Document {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  user_name?: string;
  user_avatar?: string;
  rating: number;
  content: string;
  images?: string[];
  restaurant_response?: {
    content: string;
    created_at: Date;
  };
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    user_name: {
      type: String,
    },
    user_avatar: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
    },
    images: [String],
    restaurant_response: {
      content: String,
      created_at: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Indexes for common queries
reviewSchema.index({ restaurant: 1, created_at: -1 }); // List reviews for restaurant
reviewSchema.index({ user: 1, created_at: -1 }); // User's reviews
reviewSchema.index({ restaurant: 1, rating: -1 }); // Restaurant ratings
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true }); // One review per user per restaurant

export const ReviewModel = model<ReviewDocument>("Review", reviewSchema);
