import express from "express";
import { UserController } from "../controllers/user.js";
import passport from "passport";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));
router.get("/me", [UserController.getLoggedInUser]);
router.get("/:userId", [UserController.getUserById]);
router.post("/follow/:userId", UserController.followUser);
router.post("/unfollow/:userId", UserController.unfollowUser);
export default router;
