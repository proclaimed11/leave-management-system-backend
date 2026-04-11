import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Request, Response, NextFunction, Express } from "express";
 
 
/**
* Creates a standard Express app with JSON, logging, and CORS.
*/
export const makeApp = (): Express => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  return app;
};
 
/**
* Simple custom error class with status code
*/
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
 
/**
* Global error handler to catch all errors
*/
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
};