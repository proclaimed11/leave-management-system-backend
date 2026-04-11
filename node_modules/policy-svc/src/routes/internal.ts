import { Router } from "express";
import { getFullPolicy, listLeaveTypesInternal } from "../controllers/leavePolicyController";
import { internalOnly } from "@libs/rbac";
import { getHolidaysBetween } from "../controllers/holidayController";


const router = Router();
router.get("/leave-types",internalOnly,listLeaveTypesInternal);
router.get("/full-leave-policy",getFullPolicy);


router.get(
  "/holidays/between",
  internalOnly,
  getHolidaysBetween
);


export default router;
    