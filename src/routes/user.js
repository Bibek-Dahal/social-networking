import express from "express";
import { UserController } from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

// router.use(passport.authenticate("jwt", { session: false }));
router.use(authMiddleware);
router.get("/me", [UserController.getLoggedInUser]);
router.get("/list-follow-request", UserController.listFollowRequest);
router.post(
  "/accept-follow-request/:userId",
  UserController.acceptFollowRequest
);
router.post(
  "/delete-follow-request/:userId",
  UserController.deleteFollowRequest
);
router.get("/list-user-to-follow", UserController.listUserToFollow);
router.post("/follow/:userId", UserController.followUnfollowRequest);
router.post("/unfollow/:userId", UserController.unfollowUser);
router.get("/list-user-following", UserController.listUserFollowing);
router.get("/list-user-follower", UserController.listUserFollowers);
router.get("/:userId", [UserController.getUserById]);

// router.post("/unfollow/:userId", UserController.unfollowUser);

export default router;
