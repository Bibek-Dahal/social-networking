import express from 'express';
import { UserController } from '../controllers/user.js';
import { authMiddleware } from '../middlewares/auth.js';
import { SubscriptionValidator } from '../middlewares/validators/subscription.js';
import { checkMongoId } from '../utils/checkIfMongoId.js';
const router = express.Router();

// router.use(passport.authenticate("jwt", { session: false }));
router.use(authMiddleware);

router.get('/me', [UserController.getLoggedInUser]);
router.get('/list-follow-request', UserController.listFollowRequest);
router.post(
  '/accept-follow-request/:userId',
  checkMongoId,
  UserController.acceptFollowRequest
);
router.post(
  '/delete-follow-request/:userId',
  checkMongoId,
  UserController.deleteFollowRequest
);
router.get('/list-user-to-follow', UserController.listUserToFollow);
router.post(
  '/follow/:userId',
  checkMongoId,
  UserController.followUnfollowRequest
);
router.post('/unfollow/:userId', UserController.unfollowUser);
router.get('/list-user-following', UserController.listUserFollowing);
router.get('/list-user-follower', UserController.listUserFollowers);
router.post('/subscribe-unsubscribe/:userId', [
  checkMongoId,
  SubscriptionValidator.createSubscription,
  UserController.subscribeUnsubscribeUser,
]);
router.post('/up-down-subscription/:subsId', [
  checkMongoId,
  SubscriptionValidator.upgradeOrDowngradeSubscription,
  UserController.upgradeOrDowngradeSubscription,
]);
router.get('/display-mfa-qr', [UserController.displayMfaQr]);
router.post('/enable-mfa', [UserController.enableMfa]);

router.get('/:userId', [checkMongoId, UserController.getUserById]);

// router.post("/unfollow/:userId", UserController.unfollowUser);

export default router;
