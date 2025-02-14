import { Schema, model, Document, Types } from "mongoose";

interface MealLikeDocument extends Document {
  user: Types.ObjectId;
  meal: Types.ObjectId;
  created_at: Date;
}

const mealLikeSchema = new Schema<MealLikeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    meal: {
      type: Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

// Indexes
mealLikeSchema.index({ user: 1, meal: 1 }, { unique: true }); // Prevent duplicate likes
mealLikeSchema.index({ meal: 1 }); // Count likes for meal

export const MealLikeModel = model<MealLikeDocument>(
  "MealLike",
  mealLikeSchema
);
