import { Request, Response, NextFunction, Express } from "express";
/**
* Creates a standard Express app with JSON, logging, and CORS.
*/
export declare const makeApp: () => Express;
/**
* Simple custom error class with status code
*/
export declare class HttpError extends Error {
    status: number;
    constructor(status: number, message: string);
}
/**
* Global error handler to catch all errors
*/
export declare const errorHandler: (err: any, _req: Request, res: Response, _next: NextFunction) => void;
