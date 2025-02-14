import mongoose from "mongoose";
import { Logger } from "pino";

export async function connectDatabase(logger: Logger) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10"),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5"),
      retryWrites: true,
      autoIndex: true, // Ensure indexes are created only in dev mode FOR PRODUCTION FALSE!!
    });

    logger.info("Connected to MongoDB");

    mongoose.set("debug", function (coll, method, query, doc) {
      logger.debug({ coll, method, query, doc }, "Mongoose query executed");
    });

    // 🚀 Disable autoIndex after initial connection
    setTimeout(() => {
      mongoose.set("autoIndex", false);
      logger.info("Disabled autoIndex after initial startup");
    }, 5000);
  } catch (error) {
    logger.error({ error }, "MongoDB connection error");
    process.exit(1);
  }
}
