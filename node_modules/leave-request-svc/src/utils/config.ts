import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  DIRECTORY_SVC_URL: process.env.DIRECTORY_SVC_URL ,
  LEAVE_REQUEST_SVC_URL: process.env.LEAVE_REQUEST_SVC_URL,
  ENTITLEMENT_SVC_URL: process.env.ENTITLEMENT_SVC_URL,
  POLICY_SVC_URL: process.env.POLICY_SVC_URL,
  INTERNAL_KEY: process.env.INTERNAL_SERVICE_KEY!,
};
