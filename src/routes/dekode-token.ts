import { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";

export async function dekodeTokenRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/",
    preValidation: [fastifyPassport.authenticate("jwt", { session: false })],
    handler: async (request, reply) => {
      console.log("🔍 Token Decoded Successfully:", request.currentAccount);
      return reply.send({
        message: "Token Valid",
        currentAccount: request.currentAccount,
      });
    },
  });
}
