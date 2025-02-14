"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValidationErrors = void 0;
const parseValidationErrors = (errors) => {
    return errors.map((error) => {
        // Remove the leading '.' from the dataPath if it exists
        const field = (error.instancePath || error.schemaPath || "")
            .replace(/^\./, "")
            .replace(/\//g, ".");
        // Handle different error keywords
        let message = error.message || "Invalid value";
        switch (error.keyword) {
            case "required":
                return {
                    field: error.params.missingProperty,
                    message: `${error.params.missingProperty} is required`,
                };
            case "type":
                return {
                    field,
                    message: `should be ${error.params.type}`,
                    value: error.data,
                };
            case "enum":
                return {
                    field,
                    message: `should be one of: ${error.params.allowedValues.join(", ")}`,
                    value: error.data,
                };
            default:
                return {
                    field,
                    message,
                    value: error.data,
                };
        }
    });
};
exports.parseValidationErrors = parseValidationErrors;
