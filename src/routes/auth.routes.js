import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
} from "../controllers/auth.controlers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userResetForgotPasswordValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

//unsecured route
router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);

router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validate, resetForgottenPassword);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").post(verifyJWT, getCurrentUser);

router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword,
  );

router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

export default router;
