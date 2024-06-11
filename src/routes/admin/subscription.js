import express from "express";
const router = express.Router();
import { SubscriptionController } from "../../controllers/admin/subscription.js";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/admin.js";

router.use(authMiddleware);
router.use(isAdmin);

router.get("/", [SubscriptionController.listAllSubscription]);
export default router;
