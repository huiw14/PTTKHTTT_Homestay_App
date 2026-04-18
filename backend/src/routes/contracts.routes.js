import { Router } from "express";
import {
  createContract,
  getContracts,
  getEligibleDeposits,
  updateContract,
} from "../controllers/contracts.controller.js";

const router = Router();

router.get("/", getContracts);
router.get("/eligible-deposits", getEligibleDeposits);
router.post("/", createContract);
router.put("/:maHD", updateContract);

export default router;
