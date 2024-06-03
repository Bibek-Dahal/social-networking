import express from "express";
import { AuthController } from "../controllers/auth.js";
import { AuthValidator } from "../middlewares/validators/auth_validator.js";
import passport from "passport";
const router = express.Router();

router.post("/register", [AuthValidator.register, AuthController.register]);
router.post("/login", [AuthValidator.login, AuthController.login]);
router.post("/logout", [
  passport.authenticate("jwt", { session: false }),
  AuthValidator.logout,
  AuthController.logout,
]);
router.post("/logout-from-all-devices", [
  passport.authenticate("jwt", { session: false }),
  AuthController.logoutFromAllDevice,
]);

router.post("/token/refresh", [AuthController.generateNewAccessToken]);

export default router;
