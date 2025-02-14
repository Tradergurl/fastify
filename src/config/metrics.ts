import { FastifyInstance } from "fastify";
import client from "prom-client";

class MetricsManager {
  private static instance: MetricsManager;
  private registry: client.Registry;

  // HTTP metrics
  private httpRequestDuration: client.Histogram<string>;
  private httpRequestTotal: client.Counter<string>;
  private httpRequestErrors: client.Counter<string>;
  private httpRequestSize: client.Histogram<string>;
  private httpResponseSize: client.Histogram<string>;

  // Business metrics
  private activeUsers: client.Gauge<string>;
  private appointmentBookings: client.Counter<string>;
  private serviceRequests: client.Counter<string>;

  private constructor() {
    // Create a new registry
    this.registry = new client.Registry();

    client.collectDefaultMetrics({ register: this.registry });

    // HTTP metrics
    this.httpRequestDuration = new client.Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.05, 0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // in seconds
    });

    this.httpRequestTotal = new client.Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
    });

    this.httpRequestErrors = new client.Counter({
      name: "http_request_errors_total",
      help: "Total number of HTTP request errors",
      labelNames: ["method", "route", "error_type"],
    });

    this.httpRequestSize = new client.Histogram({
      name: "http_request_size_bytes",
      help: "Size of HTTP requests in bytes",
      labelNames: ["method", "route"],
      buckets: [100, 1000, 5000, 10000, 50000, 100000],
    });

    this.httpResponseSize = new client.Histogram({
      name: "http_response_size_bytes",
      help: "Size of HTTP responses in bytes",
      labelNames: ["method", "route"],
      buckets: [100, 1000, 5000, 10000, 50000, 100000],
    });

    // Business metrics
    this.activeUsers = new client.Gauge({
      name: "active_users",
      help: "Number of active users in the system",
    });

    this.appointmentBookings = new client.Counter({
      name: "appointment_bookings_total",
      help: "Total number of appointment bookings",
      labelNames: ["status", "service_type"],
    });

    this.serviceRequests = new client.Counter({
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

  static getInstance(): MetricsManager {
    if (!MetricsManager.instance) {
      MetricsManager.instance = new MetricsManager();
    }
    return MetricsManager.instance;
  }

  // Helper methods for recording metrics
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    const labels = { method, route, status_code: statusCode.toString() };
    this.httpRequestDuration.observe(labels, duration);
    this.httpRequestTotal.inc(labels);
  }

  recordHttpError(method: string, route: string, errorType: string): void {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  recordAppointmentBooking(status: string, serviceType: string): void {
    this.appointmentBookings.inc({ status, service_type: serviceType });
  }

  recordServiceRequest(serviceType: string, status: string): void {
    this.serviceRequests.inc({ service_type: serviceType, status });
  }

  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  recordHttpResponseSize(method: string, route: string, size: number): void {
    this.httpResponseSize.observe({ method, route }, size);
  }

  // Get metrics
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): client.Registry {
    return this.registry;
  }
}

function getPayloadSize(payload: unknown): number {
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
export function setupMetrics(fastify: FastifyInstance): void {
  const metrics = MetricsManager.getInstance();

  fastify.addHook("onSend", (request, reply, payload, done) => {
    const route = request.routeOptions?.url || request.url;
    const size = getPayloadSize(payload);
    metrics.recordHttpResponseSize(request.method, route, size);

    // Pass the payload along
    done(null, payload);
  });

  // Add hooks for automatic metric collection
  fastify.addHook("onRequest", async (request, reply) => {
    request.metrics = { startTime: process.hrtime() };
  });

  fastify.addHook("onResponse", async (request, reply) => {
    if (request.metrics?.startTime) {
      const [seconds, nanoseconds] = process.hrtime(request.metrics.startTime);
      const duration = seconds + nanoseconds / 1e9;
      const route = request.routeOptions?.url || request.url;
      metrics.recordHttpRequest(
        request.method,
        route,
        reply.statusCode,
        duration
      );
    }
  });
  // Expose metrics endpoint
  fastify.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", "text/plain");
    return metrics.getMetrics();
  });

  // Register error handling
  fastify.setErrorHandler((error, request, reply) => {
    metrics.recordHttpError(
      request.method,
      request.routeOptions?.url || request.url,
      error.name || "Unknown"
    );
    reply.send(error);
  });
}

// Export singleton instance
export const getMetrics = () => MetricsManager.getInstance();
