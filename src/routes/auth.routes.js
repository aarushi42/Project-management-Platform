import { Router } from "express";
import {
  logoutUser,
  registerUser,
  loginUser,
} from "../controllers/auth.controlers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
//secure routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
