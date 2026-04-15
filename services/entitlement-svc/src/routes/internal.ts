import { Router } from "express";
import { getEmployeeEntitlements,deductEntitlement,generateEntitlementsForOne} from "../controllers/entitlementController";
import { authMiddleware } from "@libs/auth-jwt";

const router = Router();
const auth = authMiddleware as any;
router.post(
  "/entitlements/generate-for-one",
  generateEntitlementsForOne,
  auth,
);
router.get("/entitlement/:employee_number", getEmployeeEntitlements);
router.post("/entitlement/deduct", deductEntitlement);


export default router;
