import { FastifyInstance } from "fastify";
export async function redisTest(fastify: FastifyInstance) {
  fastify.get("/test", async (_, reply) => {
    try {
      await fastify.redis.set("test_key", "working");
      const value = await fastify.redis.get("test_key");
      reply.send({ message: "Redis connected successfully", value });
    } catch (error) {
      reply.status(500).send({ message: "Redis connection failed", error });
    }
  });
}
