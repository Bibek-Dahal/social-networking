import express from "express";
import passport from "passport";
import { HomeController } from "../controllers/home.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.use(authMiddleware);

router.get("/home-feed", HomeController.homeFeed);

export default router;
