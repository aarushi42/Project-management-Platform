import { Router } from "express";
import { registerUser } from "../controllers/auth.controlers.js";

const router = Router();

router.route("/register").post(registerUser);

export default router;
