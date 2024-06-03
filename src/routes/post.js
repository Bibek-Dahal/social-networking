import express from "express";
import { PostController } from "../controllers/post.js";
import { PostValidator } from "../middlewares/validators/post_validator.js";
import passport from "passport";
import { postUpload } from "../config/multer_config.js";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.patch("/", [
  postUpload.single("image"),
  ProfileValidator.updateProfile,
  ProfileController.updateProfle,
]);

export default router;
