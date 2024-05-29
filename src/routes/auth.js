import express from "express";
import { AuthController } from "../controllers/auth.js";
import { AuthValidator } from "../middlewares/validators/auth_validator.js";

const router = express.Router();

router.post("/register", [AuthValidator.register, AuthController.register]);
router.post("/login", [AuthValidator.login, AuthController.login]);

export default router;
