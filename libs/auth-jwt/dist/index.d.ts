import { RequestHandler } from "express";
export interface UserPayload {
    user_id: number;
    employee_number: string;
    email: string;
    role: string;
}
export declare const signToken: (payload: UserPayload, secret?: string, expiresIn?: string) => string;
/**
 * Verify an access token from identity-svc.
 * - If `JWT_PUBLIC_KEY` is set → RS256 (same as identity when using keypair).
 * - Otherwise → HS256 with `JWT_SECRET` (must match identity `JWT_SECRET`).
 */
export declare const verifyToken: (token: string, secret?: string) => UserPayload;
/**
 * Require authentication middleware
 */
export declare const requireAuth: RequestHandler;
/**
 * Restrict access to users with a specific role
 */
export declare const requireRole: (role: string) => RequestHandler;
/**
 * General token validation middleware
 */
export declare const authMiddleware: RequestHandler;
