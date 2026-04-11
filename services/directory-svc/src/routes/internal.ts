import { Router } from "express";
import * as Internal from "../controllers/internalController";
import * as mgr  from "../controllers/managerController";
import { internalOnly } from "@libs/rbac";



const router = Router();

router.get("/", internalOnly, Internal.listEmployees);
router.get("/active", internalOnly, Internal.listActiveEmployees);

router.get("/employee", internalOnly, Internal.internalGetEmployee);

router.get(
  "/handover-candidates",
  internalOnly,
  Internal.listHandoverCandidates
);
router.get(
  "/by-department",
  internalOnly, 
  Internal.getEmployeesByDepartment
);
router.get(
  "/department-summary",
  internalOnly,
  Internal.getDepartmentSummary
);
router.post(
  "/by-numbers",
  internalOnly,
  Internal.getEmployeesByNumbers
);

router.get("/:manager_id/subordinates", mgr.getSubordinates);

export default router;
