"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
exports.signRefreshToken = signRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function getAlgorithm() {
    if (config_1.CONFIG.AUTH.JWT_PRIVATE_KEY && config_1.CONFIG.AUTH.JWT_PUBLIC_KEY) {
        return "RS256";
    }
    return "HS256";
}
function signJwt(payload, overrideOptions // <-- allow second argument
) {
    const algorithm = getAlgorithm();
    // Default options
    const baseOptions = {
        algorithm,
        expiresIn: config_1.CONFIG.AUTH.JWT_EXPIRES_IN, // already validated as string | number
    };
    // Merge: user overrides > base options
    const finalOptions = {
        ...baseOptions,
        ...(overrideOptions || {}),
    };
    if (algorithm === "RS256") {
        return jsonwebtoken_1.default.sign(payload, config_1.CONFIG.AUTH.JWT_PRIVATE_KEY, finalOptions);
    }
    return jsonwebtoken_1.default.sign(payload, config_1.CONFIG.AUTH.JWT_SECRET, finalOptions);
}
function verifyJwt(token) {
    const algorithm = getAlgorithm();
    if (algorithm === "RS256") {
        return jsonwebtoken_1.default.verify(token, config_1.CONFIG.AUTH.JWT_PUBLIC_KEY, { algorithms: ["RS256"] });
    }
    return jsonwebtoken_1.default.verify(token, config_1.CONFIG.AUTH.JWT_SECRET, { algorithms: ["HS256"] });
}
function signRefreshToken(payload) {
    const options = {
        expiresIn: config_1.CONFIG.AUTH.JWT_REFRESH_EXPIRES_IN, // "30d"
    };
    return jsonwebtoken_1.default.sign(payload, config_1.CONFIG.AUTH.JWT_REFRESH_SECRET, options);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.CONFIG.AUTH.JWT_REFRESH_SECRET);
}
