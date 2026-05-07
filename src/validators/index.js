import { body } from "express-validator";
import { AvailableUserRole, AvailableTasksStatues } from "../utils/constants";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 2, max: 100 })
      .withMessage("Username must be between 2 and 100 characters"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .isStrongPassword()
      .withMessage(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol",
      ),

    body("fullName").optional().trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .isStrongPassword()
      .withMessage(
        "New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol",
      ),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .isStrongPassword()
      .withMessage(
        "New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol",
      ),
  ];
};

const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Project name is required"),

    body("description").optional(),
  ];
};

const addMembersToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRole)
      .withMessage("Invalid role"),
  ];
};

const createTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Task title is required")
      .isLength({ min: 1, max: 200 })
      .withMessage("Task title must be between 1 and 200 characters"),

    body("description").optional().trim(),

    body("status")
      .optional()
      .isIn(AvailableTasksStatues)
      .withMessage("Invalid task status"),

    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignee ID"),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Task title must be between 1 and 200 characters"),

    body("description").optional().trim(),

    body("status")
      .optional()
      .isIn(AvailableTasksStatues)
      .withMessage("Invalid task status"),

    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignee ID"),
  ];
};

const createSubTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Subtask title is required")
      .isLength({ min: 1, max: 200 })
      .withMessage("Subtask title must be between 1 and 200 characters"),
  ];
};

const updateSubTaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Subtask title must be between 1 and 200 characters"),

    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userResetForgotPasswordValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  createProjectValidator,
  addMembersToProjectValidator,
  createTaskValidator,
  updateTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
};
