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
exports.getMetrics = void 0;
exports.setupMetrics = setupMetrics;
const prom_client_1 = __importDefault(require("prom-client"));
class MetricsManager {
    constructor() {
        // Create a new registry
        this.registry = new prom_client_1.default.Registry();
        prom_client_1.default.collectDefaultMetrics({ register: this.registry });
        // HTTP metrics
        this.httpRequestDuration = new prom_client_1.default.Histogram({
            name: "http_request_duration_seconds",
            help: "Duration of HTTP requests in seconds",
            labelNames: ["method", "route", "status_code"],
            buckets: [0.05, 0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // in seconds
        });
        this.httpRequestTotal = new prom_client_1.default.Counter({
            name: "http_requests_total",
            help: "Total number of HTTP requests",
            labelNames: ["method", "route", "status_code"],
        });
        this.httpRequestErrors = new prom_client_1.default.Counter({
            name: "http_request_errors_total",
            help: "Total number of HTTP request errors",
            labelNames: ["method", "route", "error_type"],
        });
        this.httpRequestSize = new prom_client_1.default.Histogram({
            name: "http_request_size_bytes",
            help: "Size of HTTP requests in bytes",
            labelNames: ["method", "route"],
            buckets: [100, 1000, 5000, 10000, 50000, 100000],
        });
        this.httpResponseSize = new prom_client_1.default.Histogram({
            name: "http_response_size_bytes",
            help: "Size of HTTP responses in bytes",
            labelNames: ["method", "route"],
            buckets: [100, 1000, 5000, 10000, 50000, 100000],
        });
        // Business metrics
        this.activeUsers = new prom_client_1.default.Gauge({
            name: "active_users",
            help: "Number of active users in the system",
        });
        this.appointmentBookings = new prom_client_1.default.Counter({
            name: "appointment_bookings_total",
            help: "Total number of appointment bookings",
            labelNames: ["status", "service_type"],
        });
        this.serviceRequests = new prom_client_1.default.Counter({
            name: "service_requests_total",
            help: "Total number of service requests",
            labelNames: ["service_type", "status"],
        });
        // Register all metrics
        this.registry.registerMetric(this.httpRequestDuration);
        this.registry.registerMetric(this.httpRequestTotal);
        this.registry.registerMetric(this.httpRequestErrors);
        this.registry.registerMetric(this.httpRequestSize);
        this.registry.registerMetric(this.httpResponseSize);
        this.registry.registerMetric(this.activeUsers);
        this.registry.registerMetric(this.appointmentBookings);
        this.registry.registerMetric(this.serviceRequests);
    }
    static getInstance() {
        if (!MetricsManager.instance) {
            MetricsManager.instance = new MetricsManager();
        }
        return MetricsManager.instance;
    }
    // Helper methods for recording metrics
    recordHttpRequest(method, route, statusCode, duration) {
        const labels = { method, route, status_code: statusCode.toString() };
        this.httpRequestDuration.observe(labels, duration);
        this.httpRequestTotal.inc(labels);
    }
    recordHttpError(method, route, errorType) {
        this.httpRequestErrors.inc({ method, route, error_type: errorType });
    }
    recordAppointmentBooking(status, serviceType) {
        this.appointmentBookings.inc({ status, service_type: serviceType });
    }
    recordServiceRequest(serviceType, status) {
        this.serviceRequests.inc({ service_type: serviceType, status });
    }
    setActiveUsers(count) {
        this.activeUsers.set(count);
    }
    recordHttpResponseSize(method, route, size) {
        this.httpResponseSize.observe({ method, route }, size);
    }
    // Get metrics
    getMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.registry.metrics();
        });
    }
    getRegistry() {
        return this.registry;
    }
}
function getPayloadSize(payload) {
    if (typeof payload === "string") {
        return Buffer.byteLength(payload, "utf8");
    }
    if (Buffer.isBuffer(payload)) {
        return payload.length;
    }
    // You can add more checks if you expect other payload types.
    // Return 0 if we cannot measure it.
    return 0;
}
// Setup metrics for Fastify
function setupMetrics(fastify) {
    const metrics = MetricsManager.getInstance();
    fastify.addHook("onSend", (request, reply, payload, done) => {
        var _a;
        const route = ((_a = request.routeOptions) === null || _a === void 0 ? void 0 : _a.url) || request.url;
        const size = getPayloadSize(payload);
        metrics.recordHttpResponseSize(request.method, route, size);
        // Pass the payload along
        done(null, payload);
    });
    // Add hooks for automatic metric collection
    fastify.addHook("onRequest", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        request.metrics = { startTime: process.hrtime() };
    }));
    fastify.addHook("onResponse", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if ((_a = request.metrics) === null || _a === void 0 ? void 0 : _a.startTime) {
            const [seconds, nanoseconds] = process.hrtime(request.metrics.startTime);
            const duration = seconds + nanoseconds / 1e9;
            const route = ((_b = request.routeOptions) === null || _b === void 0 ? void 0 : _b.url) || request.url;
            metrics.recordHttpRequest(request.method, route, reply.statusCode, duration);
        }
    }));
    // Expose metrics endpoint
    fastify.get("/metrics", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        reply.header("Content-Type", "text/plain");
        return metrics.getMetrics();
    }));
    // Register error handling
    fastify.setErrorHandler((error, request, reply) => {
        var _a;
        metrics.recordHttpError(request.method, ((_a = request.routeOptions) === null || _a === void 0 ? void 0 : _a.url) || request.url, error.name || "Unknown");
        reply.send(error);
    });
}
// Export singleton instance
const getMetrics = () => MetricsManager.getInstance();
exports.getMetrics = getMetrics;
