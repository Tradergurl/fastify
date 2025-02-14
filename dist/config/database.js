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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
function connectDatabase(logger) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI, {
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10"),
                minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5"),
                retryWrites: true,
                autoIndex: true, // Ensure indexes are created only in dev mode FOR PRODUCTION FALSE!!
            });
            logger.info("Connected to MongoDB");
            mongoose_1.default.set("debug", function (coll, method, query, doc) {
                logger.debug({ coll, method, query, doc }, "Mongoose query executed");
            });
            // 🚀 Disable autoIndex after initial connection
            setTimeout(() => {
                mongoose_1.default.set("autoIndex", false);
                logger.info("Disabled autoIndex after initial startup");
            }, 5000);
        }
        catch (error) {
            logger.error({ error }, "MongoDB connection error");
            process.exit(1);
        }
    });
}
