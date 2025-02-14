"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = addReview;
exports.updateReview = updateReview;
exports.getPaginatedReviews = getPaginatedReviews;
exports.getUserReviews = getUserReviews;
exports.softDeleteReview = softDeleteReview;
exports.hardDeleteReview = hardDeleteReview;
const review_model_1 = require("../models/review.model");
const restaurant_model_1 = require("../models/restaurant.model");
const errors_1 = require("../types/errors");
const cacheInvalidation_1 = require("../utils/cacheInvalidation");
/*
export async function addReview(
  restaurantId: Types.ObjectId,
  userId: Types.ObjectId,
  userName: string,
  rating: number,
  content: string
) {
  // ✅ Save review in separate collection
  const newReview = await ReviewModel.create({
    restaurant_id: restaurantId,
    user_id: userId,
    user_name: userName,
    rating,
    content,
  });

  // ✅ Update last 5 reviews inside the restaurant
  const reviews = await ReviewModel.find({ restaurant_id: restaurantId })
    .sort({ created_at: -1 })
    .limit(5);

  await RestaurantModel.findByIdAndUpdate(restaurantId, {
    $set: { recent_reviews: reviews },
    $inc: { "rating.count": 1, "rating.average": rating },
  });

  return newReview;
}
  

export async function addReview(
  restaurantId: Types.ObjectId,
  userId: Types.ObjectId,
  userName: string,
  rating: number,
  content: string,
  images?: string[]
) {
  // ✅ Ensure the restaurant exists
  const restaurant = await RestaurantModel.findById(restaurantId);
  if (!restaurant) throw new NotFoundError("Restaurant not found.");

  // ✅ Create the review
  const newReview = await ReviewModel.create({
    restaurant: restaurantId,
    user: userId,
    user_name: userName,
    rating,
    content,
    images,
  });

  // ✅ Fetch last 5 reviews and update restaurant
  const reviews = await ReviewModel.find({ restaurant: restaurantId })
    .sort({ created_at: -1 })
    .limit(5);

  // ✅ Update rating count and re-calculate average
  const stats = await ReviewModel.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: "$restaurant",
        count: { $sum: 1 },
        average: { $avg: "$rating" },
      },
    },
  ]);

  const ratingUpdate = stats[0]
    ? { "rating.count": stats[0].count, "rating.average": stats[0].average }
    : { "rating.count": 0, "rating.average": 0 };

  await RestaurantModel.findByIdAndUpdate(restaurantId, {
    $set: {
      recent_reviews: reviews,
      ...ratingUpdate,
    },
  });

  return newReview;
}
  

export async function addAndUpdateReview(
  restaurantId: Types.ObjectId,
  userId: Types.ObjectId,
  userName?: string, // ✅ Make userName optional (for update cases)
  rating?: number,
  content?: string,
  images?: string[]
) {
  // ✅ Ensure the restaurant exists
  const restaurant = await RestaurantModel.findById(restaurantId);
  if (!restaurant) throw new NotFoundError("Restaurant not found.");

  // ✅ Check if the user has already reviewed this restaurant
  let review = await ReviewModel.findOne({
    restaurant: restaurantId,
    user: userId,
  });

  if (review) {
    // ✅ Update existing review (conditionally update only provided fields)
    if (rating !== undefined) review.rating = rating;
    if (content !== undefined) review.content = content;
    if (images !== undefined) review.images = images;
    review.updated_at = new Date();
  } else {
    // ✅ Create a new review if not found
    review = await ReviewModel.create({
      restaurant: restaurantId,
      user: userId,
      user_name: userName || "Anonymous", // ✅ Default if not provided
      rating: rating || 0,
      content: content || "",
      images: images || [],
    });
  }

  await review.save();

  // ✅ Fetch last 5 reviews and update restaurant
  const reviews = await ReviewModel.find({ restaurant: restaurantId })
    .sort({ created_at: -1 })
    .limit(5);

  // ✅ Recalculate rating stats
  const stats = await ReviewModel.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: "$restaurant",
        count: { $sum: 1 },
        average: { $avg: "$rating" },
      },
    },
  ]);

  const ratingUpdate = stats[0]
    ? { "rating.count": stats[0].count, "rating.average": stats[0].average }
    : { "rating.count": 0, "rating.average": 0 };

  await RestaurantModel.findByIdAndUpdate(restaurantId, {
    $set: {
      recent_reviews: reviews,
      ...ratingUpdate,
    },
  });

  return review;
}
  */
function addReview(restaurantId, userId, userName, rating, content, redis, images) {
    return __awaiter(this, void 0, void 0, function* () {
        // ✅ Ensure the restaurant exists
        const restaurant = yield restaurant_model_1.RestaurantModel.findById(restaurantId);
        if (!restaurant)
            throw new errors_1.NotFoundError("Restaurant not found.");
        // ✅ Create a new review
        const newReview = yield review_model_1.ReviewModel.create({
            restaurant: restaurantId,
            user: userId,
            user_name: userName,
            rating,
            content,
            images,
            is_deleted: false,
        });
        // ✅ Fetch last 5 reviews and update restaurant
        const reviews = yield review_model_1.ReviewModel.find({
            restaurant: restaurantId,
            is_deleted: false,
        })
            .sort({ created_at: -1 })
            .limit(5);
        // ✅ Recalculate rating stats
        const stats = yield review_model_1.ReviewModel.aggregate([
            { $match: { restaurant: restaurantId, is_deleted: false } },
            {
                $group: {
                    _id: "$restaurant",
                    count: { $sum: 1 },
                    average: { $avg: "$rating" },
                },
            },
        ]);
        const ratingUpdate = stats[0]
            ? { "rating.count": stats[0].count, "rating.average": stats[0].average }
            : { "rating.count": 0, "rating.average": 0 };
        yield restaurant_model_1.RestaurantModel.findByIdAndUpdate(restaurantId, {
            $set: Object.assign({ recent_reviews: reviews }, ratingUpdate),
        });
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(restaurantId, redis);
        return newReview;
    });
}
function updateReview(reviewId, userId, redis, rating, content, images) {
    return __awaiter(this, void 0, void 0, function* () {
        // ✅ Find the review and ensure the user is the owner
        const review = yield review_model_1.ReviewModel.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new errors_1.NotFoundError("Review not found or not owned by user.");
        }
        // ✅ Update the fields if they are provided
        if (rating !== undefined)
            review.rating = rating;
        if (content !== undefined)
            review.content = content;
        if (images !== undefined)
            review.images = images;
        review.updated_at = new Date();
        yield review.save();
        // ✅ Fetch last 5 reviews and update restaurant
        const reviews = yield review_model_1.ReviewModel.find({ restaurant: review.restaurant })
            .sort({ created_at: -1 })
            .limit(5);
        // ✅ Recalculate rating stats
        const stats = yield review_model_1.ReviewModel.aggregate([
            { $match: { restaurant: review.restaurant } },
            {
                $group: {
                    _id: "$restaurant",
                    count: { $sum: 1 },
                    average: { $avg: "$rating" },
                },
            },
        ]);
        const ratingUpdate = stats[0]
            ? { "rating.count": stats[0].count, "rating.average": stats[0].average }
            : { "rating.count": 0, "rating.average": 0 };
        yield restaurant_model_1.RestaurantModel.findByIdAndUpdate(review.restaurant, {
            $set: Object.assign({ recent_reviews: reviews }, ratingUpdate),
        });
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(review.restaurant, redis);
        return review;
    });
}
function getPaginatedReviews(restaurantId_1) {
    return __awaiter(this, arguments, void 0, function* (restaurantId, page = 1, limit = 10) {
        if (!restaurantId) {
            throw new Error("Restaurant ID is required.");
        }
        const skip = (page - 1) * limit;
        // ✅ Fetch total review count for pagination metadata
        const totalReviews = yield review_model_1.ReviewModel.countDocuments({
            restaurant: restaurantId,
        });
        // ✅ Fetch paginated reviews
        const reviews = yield review_model_1.ReviewModel.find({ restaurant: restaurantId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        return {
            data: reviews,
            pagination: {
                totalItems: totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: page,
                itemsPerPage: limit,
            },
        };
    });
}
function getUserReviews(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
        if (!userId) {
            throw new Error("User ID is required.");
        }
        const skip = (page - 1) * limit;
        // ✅ Fetch total user review count for pagination metadata
        const totalReviews = yield review_model_1.ReviewModel.countDocuments({ user: userId });
        // ✅ Fetch paginated user reviews
        const reviews = yield review_model_1.ReviewModel.find({ user: userId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        return {
            data: reviews,
            pagination: {
                totalItems: totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: page,
                itemsPerPage: limit,
            },
        };
    });
}
function softDeleteReview(reviewId, userId, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        // ✅ Find the review and ensure ownership
        const review = yield review_model_1.ReviewModel.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new errors_1.NotFoundError("Review not found or not owned by user.");
        }
        // ✅ Mark review as deleted
        review.is_deleted = true;
        yield review.save();
        // ✅ Fetch last 5 active reviews and update restaurant
        const reviews = yield review_model_1.ReviewModel.find({
            restaurant: review.restaurant,
            is_deleted: false,
        })
            .sort({ created_at: -1 })
            .limit(5);
        // ✅ Recalculate rating stats
        const stats = yield review_model_1.ReviewModel.aggregate([
            { $match: { restaurant: review.restaurant, is_deleted: false } },
            {
                $group: {
                    _id: "$restaurant",
                    count: { $sum: 1 },
                    average: { $avg: "$rating" },
                },
            },
        ]);
        const ratingUpdate = stats[0]
            ? { "rating.count": stats[0].count, "rating.average": stats[0].average }
            : { "rating.count": 0, "rating.average": 0 };
        yield restaurant_model_1.RestaurantModel.findByIdAndUpdate(review.restaurant, {
            $set: Object.assign({ recent_reviews: reviews }, ratingUpdate),
        });
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(review.restaurant, redis);
        return { message: "Review has been soft deleted." };
    });
}
function hardDeleteReview(reviewId, userId, redis) {
    return __awaiter(this, void 0, void 0, function* () {
        // ✅ Find and delete review
        const review = yield review_model_1.ReviewModel.findOneAndDelete({
            _id: reviewId,
            user: userId,
        });
        if (!review) {
            throw new errors_1.NotFoundError("Review not found or not owned by user.");
        }
        // ✅ Fetch last 5 active reviews and update restaurant
        const reviews = yield review_model_1.ReviewModel.find({
            restaurant: review.restaurant,
            is_deleted: false,
        })
            .sort({ created_at: -1 })
            .limit(5);
        // ✅ Recalculate rating stats
        const stats = yield review_model_1.ReviewModel.aggregate([
            { $match: { restaurant: review.restaurant, is_deleted: false } },
            {
                $group: {
                    _id: "$restaurant",
                    count: { $sum: 1 },
                    average: { $avg: "$rating" },
                },
            },
        ]);
        const ratingUpdate = stats[0]
            ? { "rating.count": stats[0].count, "rating.average": stats[0].average }
            : { "rating.count": 0, "rating.average": 0 };
        yield restaurant_model_1.RestaurantModel.findByIdAndUpdate(review.restaurant, {
            $set: Object.assign({ recent_reviews: reviews }, ratingUpdate),
        });
        yield (0, cacheInvalidation_1.invalidateRestaurantCache)(review.restaurant, redis);
        return { message: "Review has been permanently deleted." };
    });
}
