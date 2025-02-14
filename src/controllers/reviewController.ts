import { FastifyRequest, FastifyReply } from "fastify";
import { addReview, updateReview } from "../services/reviewService";
import { Types } from "mongoose";
import {
  softDeleteReview,
  hardDeleteReview,
  getPaginatedReviews,
  getUserReviews,
} from "../services/reviewService";

export async function addReviewHandler(
  request: FastifyRequest<{
    Params: { restaurantId: string };
    Body: { rating: number; content: string; images?: string[] };
  }>,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { restaurantId } = request.params;
    const { rating, content, images } = request.body;

    if (!rating || !content) {
      return reply
        .status(400)
        .send({ message: "Rating and content are required." });
    }

    // ✅ Call function with correct number of parameters
    const newReview = await addReview(
      new Types.ObjectId(restaurantId),
      request.currentAccount._id,
      `${request.currentAccount.first_name} ${request.currentAccount.last_name}`, // ✅ User name (optional in function)
      rating,
      content,
      request.server.redis,
      images
    );

    return reply.status(201).send({ message: "Review added", data: newReview });
  } catch (error) {
    request.log.error(error, "Failed to add review");
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function updateReviewHandler(
  request: FastifyRequest<{
    Params: { reviewId: string };
    Body: { rating?: number; content?: string; images?: string[] };
  }>,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { reviewId } = request.params;
    const { rating, content, images } = request.body;
    const userId = new Types.ObjectId(request.currentAccount._id);

    // ✅ Call service function
    const updatedReview = await updateReview(
      new Types.ObjectId(reviewId),
      userId,
      request.server.redis, // Pass Redis service for cache invalidation
      rating,
      content,
      images
    );

    return reply.status(200).send({
      message: "Review updated successfully.",
      data: updatedReview,
    });
  } catch (error) {
    request.log.error(error, "Updating review failed");
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function getPaginatedReviewsHandler(
  request: FastifyRequest<{
    Params: { restaurantId: string };
    Querystring: { page?: string; limit?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { restaurantId } = request.params;
    const page = parseInt(request.query.page || "1", 10);
    const limit = parseInt(request.query.limit || "10", 10);

    const result = await getPaginatedReviews(
      new Types.ObjectId(restaurantId),
      page,
      limit
    );

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Fetching restaurant reviews failed");
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function getUserReviewsHandler(
  request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const page = parseInt(request.query.page || "1", 10);
    const limit = parseInt(request.query.limit || "10", 10);
    const userId = new Types.ObjectId(request.currentAccount._id);

    const result = await getUserReviews(userId, page, limit);

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Fetching user reviews failed");
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

// ✅ Soft Delete Review Handler
export async function softDeleteReviewHandler(
  request: FastifyRequest<{ Params: { reviewId: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { reviewId } = request.params;
    const userId = new Types.ObjectId(request.currentAccount._id);

    const result = await softDeleteReview(
      new Types.ObjectId(reviewId),
      userId,
      request.server.redis
    );

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Soft delete review failed");
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

// ✅ Hard Delete Review Handler
export async function hardDeleteReviewHandler(
  request: FastifyRequest<{ Params: { reviewId: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.currentAccount) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { reviewId } = request.params;
    const userId = new Types.ObjectId(request.currentAccount._id);

    const result = await hardDeleteReview(
      new Types.ObjectId(reviewId),
      userId,
      request.server.redis
    );

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Hard delete review failed");
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

//delete review
//soft dele
//responde to review
//get all reviews for a restaurant
//get all reviews for a user
//get review by id
