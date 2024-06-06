import express from "express";
import passport from "passport";
import { CommentController } from "../controllers/comment.js";
import { CommentValidator } from "../middlewares/validators/comment.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();
router.use(authMiddleware);

router.post("/:postId", [
  CommentValidator.createComment,
  CommentController.createComment,
]);
router.put("/:commentId", [
  CommentValidator.updateComment,
  CommentController.updateComment,
]);

// router.get("/:commentId", CommentController);

router.get("/post/:postId", CommentController.listAllCommentOfPost);

router.delete("/:commentId", [CommentController.deleteComment]);

export default router;
