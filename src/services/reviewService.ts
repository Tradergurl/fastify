import { ReviewModel } from "../models/review.model";
import { RestaurantModel } from "../models/restaurant.model";
import { NotFoundError } from "../types/errors";
import { Types } from "mongoose";
import { RedisService } from "../config/redis";
import { invalidateRestaurantCache } from "../utils/cacheInvalidation";
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

export async function addReview(
  restaurantId: Types.ObjectId,
  userId: Types.ObjectId,
  userName: string,
  rating: number,
  content: string,
  redis: RedisService,
  images?: string[]
) {
  // ✅ Ensure the restaurant exists
  const restaurant = await RestaurantModel.findById(restaurantId);
  if (!restaurant) throw new NotFoundError("Restaurant not found.");

  // ✅ Create a new review
  const newReview = await ReviewModel.create({
    restaurant: restaurantId,
    user: userId,
    user_name: userName,
    rating,
    content,
    images,
    is_deleted: false,
  });

  // ✅ Fetch last 5 reviews and update restaurant
  const reviews = await ReviewModel.find({
    restaurant: restaurantId,
    is_deleted: false,
  })
    .sort({ created_at: -1 })
    .limit(5);

  // ✅ Recalculate rating stats
  const stats = await ReviewModel.aggregate([
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

  await RestaurantModel.findByIdAndUpdate(restaurantId, {
    $set: {
      recent_reviews: reviews,
      ...ratingUpdate,
    },
  });

  await invalidateRestaurantCache(restaurantId, redis);

  return newReview;
}

export async function updateReview(
  reviewId: Types.ObjectId,
  userId: Types.ObjectId,
  redis: RedisService,
  rating?: number,
  content?: string,
  images?: string[]
) {
  // ✅ Find the review and ensure the user is the owner
  const review = await ReviewModel.findOne({ _id: reviewId, user: userId });

  if (!review) {
    throw new NotFoundError("Review not found or not owned by user.");
  }

  // ✅ Update the fields if they are provided
  if (rating !== undefined) review.rating = rating;
  if (content !== undefined) review.content = content;
  if (images !== undefined) review.images = images;
  review.updated_at = new Date();

  await review.save();

  // ✅ Fetch last 5 reviews and update restaurant
  const reviews = await ReviewModel.find({ restaurant: review.restaurant })
    .sort({ created_at: -1 })
    .limit(5);

  // ✅ Recalculate rating stats
  const stats = await ReviewModel.aggregate([
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

  await RestaurantModel.findByIdAndUpdate(review.restaurant, {
    $set: {
      recent_reviews: reviews,
      ...ratingUpdate,
    },
  });

  await invalidateRestaurantCache(review.restaurant, redis);

  return review;
}

export async function getPaginatedReviews(
  restaurantId: Types.ObjectId,
  page: number = 1,
  limit: number = 10
) {
  if (!restaurantId) {
    throw new Error("Restaurant ID is required.");
  }

  const skip = (page - 1) * limit;

  // ✅ Fetch total review count for pagination metadata
  const totalReviews = await ReviewModel.countDocuments({
    restaurant: restaurantId,
  });

  // ✅ Fetch paginated reviews
  const reviews = await ReviewModel.find({ restaurant: restaurantId })
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
}

export async function getUserReviews(
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 10
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const skip = (page - 1) * limit;

  // ✅ Fetch total user review count for pagination metadata
  const totalReviews = await ReviewModel.countDocuments({ user: userId });

  // ✅ Fetch paginated user reviews
  const reviews = await ReviewModel.find({ user: userId })
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
}

export async function softDeleteReview(
  reviewId: Types.ObjectId,
  userId: Types.ObjectId,
  redis: RedisService
) {
  // ✅ Find the review and ensure ownership
  const review = await ReviewModel.findOne({ _id: reviewId, user: userId });

  if (!review) {
    throw new NotFoundError("Review not found or not owned by user.");
  }

  // ✅ Mark review as deleted
  review.is_deleted = true;
  await review.save();

  // ✅ Fetch last 5 active reviews and update restaurant
  const reviews = await ReviewModel.find({
    restaurant: review.restaurant,
    is_deleted: false,
  })
    .sort({ created_at: -1 })
    .limit(5);

  // ✅ Recalculate rating stats
  const stats = await ReviewModel.aggregate([
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

  await RestaurantModel.findByIdAndUpdate(review.restaurant, {
    $set: {
      recent_reviews: reviews,
      ...ratingUpdate,
    },
  });

  await invalidateRestaurantCache(review.restaurant, redis);

  return { message: "Review has been soft deleted." };
}

export async function hardDeleteReview(
  reviewId: Types.ObjectId,
  userId: Types.ObjectId,
  redis: RedisService
) {
  // ✅ Find and delete review
  const review = await ReviewModel.findOneAndDelete({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw new NotFoundError("Review not found or not owned by user.");
  }

  // ✅ Fetch last 5 active reviews and update restaurant
  const reviews = await ReviewModel.find({
    restaurant: review.restaurant,
    is_deleted: false,
  })
    .sort({ created_at: -1 })
    .limit(5);

  // ✅ Recalculate rating stats
  const stats = await ReviewModel.aggregate([
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

  await RestaurantModel.findByIdAndUpdate(review.restaurant, {
    $set: {
      recent_reviews: reviews,
      ...ratingUpdate,
    },
  });

  await invalidateRestaurantCache(review.restaurant, redis);

  return { message: "Review has been permanently deleted." };
}
