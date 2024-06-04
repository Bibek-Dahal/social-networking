import express from "express";
import passport from "passport";
import { HomeController } from "../controllers/home.js";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get("/home-feed", HomeController.homeFeed);

export default router;
