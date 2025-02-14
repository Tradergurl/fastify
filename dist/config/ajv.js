"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaRegistry = void 0;
exports.configureAjv = configureAjv;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
// Create a singleton for the schema registry
class SchemaRegistryManager {
    constructor() {
        this.registry = new Map();
        this.ajv = new ajv_1.default({
            removeAdditional: "all",
            useDefaults: true,
            coerceTypes: true,
            allErrors: true,
            strict: true,
        });
        (0, ajv_formats_1.default)(this.ajv);
        this.ajv.addFormat("objectId", {
            type: "string",
            validate: (x) => /^[0-9a-fA-F]{24}$/.test(x),
        });
    }
    static getInstance() {
        if (!SchemaRegistryManager.instance) {
            SchemaRegistryManager.instance = new SchemaRegistryManager();
        }
        return SchemaRegistryManager.instance;
    }
    createRouteKey(method, url, part) {
        return `${method}-${url}-${part}`;
    }
    registerSchema(route) {
        const key = this.createRouteKey(route.method, route.url, route.part);
        const compiledSchema = this.ajv.compile(route.schema);
        this.registry.set(key, compiledSchema);
    }
    getCompiledSchema(method, url, part) {
        const key = this.createRouteKey(method, url, part);
        return this.registry.get(key);
    }
    getAjv() {
        return this.ajv;
    }
    registerSchemas(routes) {
        routes.forEach((route) => this.registerSchema(route));
    }
}
// Configure Ajv for Fastify
function configureAjv(fastify) {
    const schemaRegistry = SchemaRegistryManager.getInstance();
    // Create the validator compiler with proper types
    const validatorCompiler = ({ schema, }) => {
        return schemaRegistry.getAjv().compile(schema);
    };
    // Set the validator compiler
    fastify.setValidatorCompiler(validatorCompiler);
}
// Export for use in tests or other parts of the application
const getSchemaRegistry = () => SchemaRegistryManager.getInstance();
exports.getSchemaRegistry = getSchemaRegistry;
