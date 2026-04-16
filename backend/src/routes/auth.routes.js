import { Router } from "express";
import { changePassword, login, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/logout", logout);

export default router;
