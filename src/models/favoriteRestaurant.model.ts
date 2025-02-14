import { Schema, model, Document, Types } from "mongoose";

interface UserFavoriteDocument extends Document {
  user: Types.ObjectId;
  restaurants: Types.ObjectId[];
  created_at: Date;
}

const userFavoriteSchema = new Schema<UserFavoriteDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    restaurants: [{ type: Schema.Types.ObjectId, ref: "Restaurant" }],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Index to speed up queries
userFavoriteSchema.index({ user: 1, restaurants: 1 });

export const UserFavoriteModel = model<UserFavoriteDocument>(
  "UserFavorite",
  userFavoriteSchema
);
