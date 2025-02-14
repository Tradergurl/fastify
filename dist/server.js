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
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fastify = yield (0, app_1.default)();
            const log = fastify.log;
            // Initialize database connection
            yield (0, database_1.connectDatabase)(log);
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
                process.on(signal, () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield fastify.close();
                        log.info("Application shut down gracefully");
                        process.exit(0);
                    }
                    catch (err) {
                        log.error(err, "Error during shutdown");
                        process.exit(1);
                    }
                }));
            });
        }
        catch (err) {
            console.error("Fatal error during startup:", err);
            process.exit(1);
        }
    });
}
start();
