import App from "./app";
import dotenv from "dotenv";
import { Logger } from "pino";
import { connectDatabase } from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const fastify = await App();
    const log = fastify.log as Logger;

    // Initialize database connection
    await connectDatabase(log);

    const PORT = process.env.PORT || 3000;
    fastify.listen({ port: Number(PORT), host: "0.0.0.0" }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`🚀 Server running on port ${PORT}`);
    });
    // Graceful shutdown
    const signals = ["SIGINT", "SIGTERM"];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        try {
          await fastify.close();
          log.info("Application shut down gracefully");
          process.exit(0);
        } catch (err) {
          log.error(err, "Error during shutdown");
          process.exit(1);
        }
      });
    });
  } catch (err) {
    console.error("Fatal error during startup:", err);
    process.exit(1);
  }
}

start();
