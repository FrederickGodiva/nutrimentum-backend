import express from "express";
import passport from "passport";
import { registerUser, loginUser, logoutUser } from "./auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  loginUser
);
router.post("/logout", logoutUser);

export default router;
