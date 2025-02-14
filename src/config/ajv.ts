import { FastifyInstance, FastifySchemaCompiler } from "fastify";
import { TSchema } from "@sinclair/typebox";
import Ajv from "ajv";
import addFormats from "ajv-formats";

// Type definitions
type SchemaPartType = "params" | "querystring" | "body" | "response";

interface RouteConfig {
  method: string;
  url: string;
  part: SchemaPartType;
  schema: TSchema; // Changed to TSchema from TypeBox
}

// Improve type safety for schema compilation
interface SchemaCompilationContext {
  schema: TSchema;
  method: string;
  url: string;
  httpPart: SchemaPartType | string;
}

type SchemaRegistry = Map<string, ReturnType<Ajv["compile"]>>;

// Create a singleton for the schema registry
class SchemaRegistryManager {
  private static instance: SchemaRegistryManager;
  private registry: SchemaRegistry = new Map();
  private ajv: Ajv;

  private constructor() {
    this.ajv = new Ajv({
      removeAdditional: "all",
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
      strict: true,
    });

    addFormats(this.ajv);

    this.ajv.addFormat("objectId", {
      type: "string",
      validate: (x: string) => /^[0-9a-fA-F]{24}$/.test(x),
    });
  }

  static getInstance(): SchemaRegistryManager {
    if (!SchemaRegistryManager.instance) {
      SchemaRegistryManager.instance = new SchemaRegistryManager();
    }
    return SchemaRegistryManager.instance;
  }

  private createRouteKey(
    method: string,
    url: string,
    part: SchemaPartType
  ): string {
    return `${method}-${url}-${part}`;
  }

  registerSchema(route: RouteConfig): void {
    const key = this.createRouteKey(route.method, route.url, route.part);
    const compiledSchema = this.ajv.compile(route.schema);
    this.registry.set(key, compiledSchema);
  }

  getCompiledSchema(method: string, url: string, part: SchemaPartType) {
    const key = this.createRouteKey(method, url, part);
    return this.registry.get(key);
  }

  getAjv(): Ajv {
    return this.ajv;
  }

  registerSchemas(routes: RouteConfig[]): void {
    routes.forEach((route) => this.registerSchema(route));
  }
}

// Configure Ajv for Fastify
export function configureAjv(fastify: FastifyInstance): void {
  const schemaRegistry = SchemaRegistryManager.getInstance();

  // Create the validator compiler with proper types
  const validatorCompiler: FastifySchemaCompiler<SchemaCompilationContext> = ({
    schema,
  }) => {
    return schemaRegistry.getAjv().compile(schema);
  };

  // Set the validator compiler
  fastify.setValidatorCompiler(validatorCompiler);
}

// Export for use in tests or other parts of the application
export const getSchemaRegistry = () => SchemaRegistryManager.getInstance();
