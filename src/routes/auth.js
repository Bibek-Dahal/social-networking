import express from "express";
import { AuthController } from "../controllers/auth.js";
import { AuthValidator } from "../middlewares/validators/auth_validator.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", [AuthValidator.register, AuthController.register]);
router.post("/login", [AuthValidator.login, AuthController.login]);
router.post("/password-change", [
  authMiddleware,
  AuthValidator.passwordChange,
  AuthController.passwordChange,
]);
router.post("/password-reset", [
  AuthValidator.passwordReset,
  AuthController.passwordReset,
]);

router.post("/password-reset/confirm/:token", [
  AuthValidator.passwordResetConfirm,
  AuthController.passwordResetConfirm,
]);

router.post("/logout", [
  authMiddleware,
  AuthValidator.logout,
  AuthController.logout,
]);
router.post("/logout-from-all-devices", [
  authMiddleware,
  AuthController.logoutFromAllDevice,
]);

router.post("/token/refresh", [AuthController.generateNewAccessToken]);
router.post("/verify-email", AuthController.verifyEmail);

export default router;
