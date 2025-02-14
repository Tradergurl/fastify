// meal.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { MealType } from "../types/enums";

interface MealDocument extends Document {
  restaurant: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  ingredients: string[];
  allergens: string[];
  is_vegan: boolean;
  type: MealType;
  likes: number;
  status: {
    is_available: boolean;
    is_active: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

const mealSchema = new Schema<MealDocument>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    ingredients: [
      {
        type: String,
        required: true,
      },
    ],
    allergens: [String],
    is_vegan: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MealType),
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    status: {
      is_available: { type: Boolean, default: true },
      is_active: { type: Boolean, default: true },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mealSchema.index({ restaurant: 1 });
mealSchema.index({ name: 1 });
mealSchema.index({ category: 1 });
mealSchema.index({ is_vegan: 1 });
mealSchema.index({ likes: -1 });

export const MealModel = model<MealDocument>("Meal", mealSchema);
