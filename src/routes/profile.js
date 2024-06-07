import express from "express";
import { ProfileController } from "../controllers/profile.js";
import { ProfileValidator } from "../middlewares/validators/profile_validator.js";
import { avatarUpload } from "../config/multer_config.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.patch("/", [
  avatarUpload.single("avatar"),
  ProfileValidator.updateProfile,
  ProfileController.updateProfle,
]);

router.get("/", [ProfileController.getProfile]);
router.get("/:profileId", [ProfileController.getProfileById]);

export default router;
