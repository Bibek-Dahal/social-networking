import express from "express";
import passport from "passport";
import { AdminUserController } from "../../controllers/admin/user.js";
import { isAdmin } from "../../middlewares/admin.js";
import { AdminUserValidator } from "../../middlewares/validators/admin/auth_validator.js";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(isAdmin);

router.get("/", [AdminUserController.listAllUser]);
router.get("/:userId", [AdminUserController.getUserByid]);
router.post("/", [
  AdminUserValidator.createUser,
  AdminUserController.createUser,
]);
router.put("/:userId", [
  AdminUserValidator.updateUser,
  AdminUserController.updateUser,
]);

export default router;
