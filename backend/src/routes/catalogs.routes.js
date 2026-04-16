import { Router } from "express";
import {
  createAccount,
  createAsset,
  createBranch,
  createPolicy,
  createRoom,
  createService,
  getAccounts,
  getAssets,
  getBranches,
  getCatalogMeta,
  getPolicies,
  getRooms,
  getServices,
  updateAccount,
  updateAsset,
  updateBranch,
  updatePolicy,
  updateRoom,
  updateService,
} from "../controllers/catalogs.controller.js";

const router = Router();

router.get("/meta", getCatalogMeta);

router.get("/accounts", getAccounts);
router.post("/accounts", createAccount);
router.put("/accounts/:maTK", updateAccount);

router.get("/branches", getBranches);
router.post("/branches", createBranch);
router.put("/branches/:maCN", updateBranch);

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.put("/rooms/:maPhong", updateRoom);

router.get("/assets", getAssets);
router.post("/assets", createAsset);
router.put("/assets/:maTS", updateAsset);

router.get("/services", getServices);
router.post("/services", createService);
router.put("/services/:maDV", updateService);

router.get("/policies", getPolicies);
router.post("/policies", createPolicy);
router.put("/policies/:maCS", updatePolicy);

export default router;
