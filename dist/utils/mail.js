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
exports.verifyEmailToken = exports.sendVerificationEmail = exports.authConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
// Create email transporter
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT || "587"),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});
// Configuration object
exports.authConfig = {
    verification: {
        tokenExpiryHours: 1,
        maxAttempts: 3,
        tokenLength: 32,
    },
    baseUrl: process.env.BASE_URL || "https://your-api-domain.com",
    defaultLanguage: "pl",
    passwordMinLength: 8,
};
const createEmailTemplate = (verificationUrl) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              background-color: #4CAF50;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Welcome to Our Platform!</h1>
            <p>Thank you for signing up. To start using our platform, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${verificationUrl}</p>
            <div class="footer">
              <p>This verification link will expire in 1 hour.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
};
// Create verification URL
const createVerificationUrl = (baseUrl, email, token) => {
    const encodedEmail = Buffer.from(email).toString("base64");
    // Make sure baseUrl doesn't end with a slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    // Construct the full verification URL
    return `${cleanBaseUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(encodedEmail)}`;
};
// Send verification email
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate inputs
        if (!email || !token) {
            throw new Error("Email and token are required");
        }
        // Create verification URL
        const verificationUrl = createVerificationUrl(exports.authConfig.baseUrl, email, token);
        console.log("Generated verification URL:", verificationUrl);
        // Create email content
        const emailContent = {
            from: process.env.EMAIL_FROM || "noreply@yourplatform.com",
            to: email,
            subject: "Verify Your Email Address",
            html: createEmailTemplate(verificationUrl),
            text: `Welcome to Our Platform! Please verify your email by visiting: ${verificationUrl}`, // Fallback plain text
        };
        // Send email
        const info = yield transporter.sendMail(emailContent);
        console.log("Verification email sent:", info.messageId);
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        // Throw a more specific error
        if (error instanceof Error) {
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
        else {
            throw new Error("Failed to send verification email");
        }
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
// Add a verification check function
const verifyEmailToken = (encodedEmail, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Decode email
        const email = Buffer.from(encodedEmail, "base64").toString();
        // Find user with matching token and email
        const user = yield user_model_1.UserModel.findOne({
            email,
            email_verification_token: token,
            email_verification_expires: { $gt: new Date() },
        });
        if (!user) {
            return false;
        }
        // Update user verification status
        user.is_email_verified = true;
        user.verification_data.verified = true;
        yield user.save();
        return true;
    }
    catch (error) {
        console.error("Error verifying email:", error);
        return false;
    }
});
exports.verifyEmailToken = verifyEmailToken;
