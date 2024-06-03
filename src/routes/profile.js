import express from "express";
import { ProfileController } from "../controllers/profile.js";
import { ProfileValidator } from "../middlewares/validators/profile_validator.js";
import passport from "passport";
import { avatarUpload } from "../config/multer_config.js";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.patch("/", [
  avatarUpload.single("avatar"),
  ProfileValidator.updateProfile,
  ProfileController.updateProfle,
]);

export default router;
