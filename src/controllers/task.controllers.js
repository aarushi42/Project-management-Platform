import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/async-handler.js";

import { Mongoose } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  //test
});

const createTask = asyncHandler(async (req, res) => {
  //test
});

const getTaskById = asyncHandler(async (req, res) => {
  //test
});

const updateTask = asyncHandler(async (req, res) => {
  //test
});

const deleteTask = asyncHandler(async (req, res) => {
  //test
});

const createSubTask = asyncHandler(async (req, res) => {
  //test
});

const updateSubTask = asyncHandler(async (req, res) => {
  //test
});

const deleteSubTask = asyncHandler(async (req, res) => {
  //test
});

export {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
