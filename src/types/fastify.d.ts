import {
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import {
  FastifyTypeProvider,
  FastifyTypeProviderDefault,
} from "fastify/types/type-provider";
import { RouteGenericInterface } from "fastify/types/route";
import { Server, IncomingMessage, ServerResponse } from "http";
import { DTOAccount } from "../interfaces";
import { RedisService } from "../config/redis";

declare module "fastify" {
  interface FastifyRequest<
    Body = any,
    Reply = any,
    RawServer = Server<typeof IncomingMessage, typeof ServerResponse>,
    IncomingMessage = IncomingMessage,
    Schema = any,
    TypeProvider = TypeProviderDefault,
    User = unknown,
    Logger = FastifyBaseLogger,
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  > {
    currentAccount?: DTOAccount;
    timerStart?: bigint;
    metrics?: {
      startTime: [number, number];
    };
  }
  interface FastifyInstance {
    redis: RedisService;
  }
}
