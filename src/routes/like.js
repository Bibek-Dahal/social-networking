import express from "express";
import passport from "passport";
import { LikeController } from "../controllers/like.js";

const router = express.Router();
router.use(passport.authenticate("jwt", { session: false }));

router.post("/:postId", [LikeController.createDeleteLike]);

router.get("/post/:postId", LikeController.listAllLikeOfPost);

export default router;
