import { Router } from "express";
import {
  createContract,
  getContracts,
  getEligibleDeposits,
  updateContract,
} from "../controllers/contracts.controller.js";
import { contractUpload, attachFileInfo, handleUploadError } from "../app/middlewares/uploadMiddleware.js";
import { requireRoles } from "../app/middlewares/authGuard.js";

const router = Router();

router.get("/", requireRoles('sale', 'quanly', 'admin'), getContracts);
router.get("/eligible-deposits", requireRoles('sale', 'quanly', 'admin'), getEligibleDeposits);
router.post("/", requireRoles('quanly', 'admin'), contractUpload.single('anhHD'), attachFileInfo, handleUploadError, createContract);
router.put("/:maHD", requireRoles('quanly', 'admin'), contractUpload.single('anhHD'), attachFileInfo, handleUploadError, updateContract);

export default router;
