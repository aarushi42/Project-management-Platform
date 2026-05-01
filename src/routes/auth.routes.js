import { Router } from "express";
import { registerUser } from "../controllers/auth.controlers.js";
import { loginUser } from "../controllers/auth.controlers.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;
