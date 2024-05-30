import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { UserController } from "../controllers/user.js";
import passport from "passport";
const router = express.Router();

router.get("/me", [
  passport.authenticate("jwt", { session: false }),
  UserController.getLoggedInUser,
]);

export default router;
