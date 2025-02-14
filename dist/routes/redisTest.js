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
exports.redisTest = redisTest;
function redisTest(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get("/test", (_, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield fastify.redis.set("test_key", "working");
                const value = yield fastify.redis.get("test_key");
                reply.send({ message: "Redis connected successfully", value });
            }
            catch (error) {
                reply.status(500).send({ message: "Redis connection failed", error });
            }
        }));
    });
}
