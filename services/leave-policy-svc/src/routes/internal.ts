import { Router } from "express";
import { getFullPolicy, listLeaveTypesInternal } from "../controllers/leavePolicyController";
import { internalOnly } from "@libs/rbac";
import { getHolidaysBetween } from "../controllers/holidayController";


const router = Router();
const internal = internalOnly as any;
router.get("/leave-types",internal,listLeaveTypesInternal);
router.get("/full-leave-policy",getFullPolicy);


router.get(
  "/holidays/between",
  internal,
  getHolidaysBetween
);


export default router;
    