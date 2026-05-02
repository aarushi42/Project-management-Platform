import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens", [error.message]);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //accept the data from the request body
  const { email, username, password } = req.body;

  //check if the user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  //if not, create a new user
  if (userExists) {
    throw new ApiError(
      409,
      "User with this email or username already exists",
      [],
    );
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Email Verification",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`, //dynamic verification link
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user",
      [],
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully. Please check your email to verify your account.",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required", []);
  }
  if (!password) {
    throw new ApiError(400, "Password is required", []);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User doesn't exist", []);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials", []);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: "" },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "Current user fetched successfully",
      ),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Verification token is missing", []);
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired", []);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: user.isEmailVerified,
      },
      "Email is  verified successfully. ",
    ),
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  //find user by id
  const user = await User.findById(req.user._id);
  //if no user send error 404
  if (!user) {
    throw new ApiError(404, "User does not Exists");
  }
  //if user is already verified send error 409
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is Already verified!");
  }
  //if not verified then repeat the process of generating token and sending email
  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`, //dynamic verification link
    ),
  });
  //send res 200,json200, {}, mail sen
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Verification email sent to your email address"),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //get the refresh token through req.cokies or req.body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  //if no token erroe 401 unauthorized
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request", []);
  }
  try {
    //verify jwt token and get the user id from the payload
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    //find by id
    const user = await User.findById(decodedToken?.userId);

    // if no user throw error 401 invalid refresh token
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token!", []);
    }

    // if token from request doesn't match with the token in db then error 401 refresh token expired
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired", []);
    }

    //create options for cookie
    const options = {
      httpOnly: true,
      secure: true,
    };

    // generate new access token and refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    //save refresh token in db
    user.refreshToken = newRefreshToken;

    await user.save();

    //send response 200, cookie with new access token and refresh token in cookie
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token", []);
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  //get email from the body
  const { email } = req.body;
  // search the user from db
  const user = await User.findOne({ email });
  //no user error 404 user not found
  if (!user) {
    throw new ApiError(404, "User does not exist with this email");
  }
  // genrate temporary token and save in db
  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();
  // save forgotpasstoken and expiry in db
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  // save the user
  await user.save({ validateBeforeSave: false });
  //send email with the link containing the token
  await sendEmail({
    email: user?.email,
    subject: "Forgot Password Request",
    mailgenContent: forgotPasswordMailgenContent(
      user?.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`, //forgot password link
    ),
  });
  // return res 200 json with message that email has been sent if the user exists. This is to prevent email enumeration attacks.
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset link has been sent to your email address.",
      ),
    );
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  //get the data
  const { resetToken } = req.params;
  const { newPassword } = req.body;
  //get hashed token from the params
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //find user based on token and expiry
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  //no user 489, token is invalid or expired
  if (!user) {
    throw new ApiError(489, "Token is invalid or expired", []);
  }
  //undefine forgotpass and token expiry, set new password and save the user
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.password = newPassword;
  //save the use
  await user.save({ validateBeforeSave: false });
  //retrun res  200, json with message password reset successfully
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //get old password and new password from the body
  const { oldPassword, newPassword } = req.body;

  //find one user
  const user = await User.findById(req?.user?._id);

  //if no user error 404 user not found
  if (!user) {
    throw new ApiError(400, "No user found");
  }

  //check if old password is correct
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  //if not valid
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old Password", []);
  }

  //if valid save the new password
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  //return res 200 json with message password changed successfully
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
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
};
