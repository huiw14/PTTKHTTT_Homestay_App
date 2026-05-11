import { Router } from "express";
import { changePassword, login, logout } from "../controllers/auth.controller.js";
import { requireRoles } from "../app/middlewares/authGuard.js";

const router = Router();

router.post("/login", login);
router.post("/change-password", requireRoles('sale', 'quanly', 'ketoan', 'admin'), changePassword);
router.post("/logout", requireRoles('sale', 'quanly', 'ketoan', 'admin'), logout);

export default router;
