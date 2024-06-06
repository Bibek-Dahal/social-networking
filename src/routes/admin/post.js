import express from "express";
import passport from "passport";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/admin.js";

import { AdminPostController } from "../../controllers/admin/post.js";
const router = express.Router();

router.use(authMiddleware);
router.use(isAdmin);

router.get("/", [AdminPostController.listPost]);

export default router;
