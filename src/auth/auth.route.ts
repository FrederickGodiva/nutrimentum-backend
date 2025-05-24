import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  currentUser,
} from "./auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", currentUser);
router.post("/refresh-token", refreshAccessToken);
router.delete("/logout", logoutUser);

export default router;
