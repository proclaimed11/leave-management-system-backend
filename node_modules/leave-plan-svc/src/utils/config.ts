import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  DIRECTORY_SVC_URL: process.env.DIRECTORY_SVC_URL || "http://localhost:3002",
  LEAVE_REQUEST_SVC_URL: process.env.LEAVE_REQUEST_SVC_URL || "http://localhost:3003",
  ENTITLEMENT_SVC_URL: process.env.ENTITLEMENT_SVC_URL || "http://localhost:3005",
  POLICY_SVC_URL: process.env.POLICY_SVC_URL || "http://localhost:3004",
};
