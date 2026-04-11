import { Request } from "express";
import { JwtUser } from "./types";

export interface AuthRequest extends Request {
  user?: JwtUser;  
}