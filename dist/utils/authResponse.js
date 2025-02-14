"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthResponse = createAuthResponse;
const jwt_1 = require("../utils/jwt");
function createAuthResponse(account, user, message, includeToken = true) {
    const token = includeToken
        ? (0, jwt_1.signJwt)(user._id.toString(), account._id.toString(), account.role)
        : "";
    return {
        message,
        data: {
            token: token || "",
            _id: account._id.toString(),
            account: {
                // ✅ Ensure "account" key is present
                _id: account._id.toString(),
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    status: user.status,
                },
                role: account.role,
                first_name: account.first_name,
                last_name: account.last_name,
                avatar: account.avatar,
            },
            businessSetup: {
                required: false,
                missingFields: undefined,
            },
        },
    };
}
