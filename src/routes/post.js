import express from "express";
import { PostController } from "../controllers/post.js";
import passport from "passport";
import { postUpload } from "../config/multer_config.js";
import { PostValidator } from "../middlewares/validators/post_validator.js";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.post("/", [
  postUpload.single("image"),
  PostValidator.createPost,
  PostController.createPost,
]);

router.patch("/:id", [
  postUpload.single("image"),
  PostValidator.updatePost,
  PostController.updatePost,
]);
//list all user posts
router.get("/", [PostController.listAllPosts]);

router.delete("/:id", PostController.deletePost);

router.get("/:id", PostController.getPostById);

export default router;
