import { Schema, model, Document, Types } from "mongoose";

interface PromotionDocument extends Document {
  restaurant: Types.ObjectId;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  image?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  terms_conditions?: string;
  is_active: boolean;
}

const promotionSchema = new Schema<PromotionDocument>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    terms_conditions: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Indexes
promotionSchema.index({ restaurant: 1, is_active: -1 });

export const PromotionModel = model<PromotionDocument>(
  "Promotion",
  promotionSchema
);
