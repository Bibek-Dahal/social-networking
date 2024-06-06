import express from "express";
import passport from "passport";
import { LikeController } from "../controllers/like.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/:postId", [LikeController.createDeleteLike]);

router.get("/post/:postId", LikeController.listAllLikeOfPost);

export default router;
