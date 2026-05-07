import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/async-handler.js";

import mongoose, { Mongoose } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username email");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new Mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new Mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new Mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: { _id: new Mongoose.Types.ObjectId(taskId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: { $arrayElemAt: ["$createdBy", 0] },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: { $arrayElemAt: ["$assignedTo", 0] },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task retrieved successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, status, assignedTo } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findOne({
    _id: new Mongoose.Types.ObjectId(taskId),
    project: new Mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (assignedTo !== undefined) {
    task.assignedTo = assignedTo
      ? new Mongoose.Types.ObjectId(assignedTo)
      : null;
  }

  const updatedTask = await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findOneAndDelete({
    _id: new Mongoose.Types.ObjectId(taskId),
    project: new Mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await SubTask.deleteMany({
    task: new Mongoose.Types.ObjectId(taskId),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findOne({
    _id: new Mongoose.Types.ObjectId(taskId),
    project: new Mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await SubTask.create({
    title,
    task: new Mongoose.Types.ObjectId(taskId),
    createdBy: new Mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const subtask = await SubTask.findById(subTaskId);

  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  const task = await Task.findOne({
    _id: subtask.task,
    project: new Mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Subtask not found in this project");
  }

  if (title !== undefined) subtask.title = title;
  if (isCompleted !== undefined) subtask.isCompleted = isCompleted;

  const updatedSubTask = await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubTask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const subtask = await SubTask.findById(subTaskId);

  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  const task = await Task.findOne({
    _id: subtask.task,
    project: new Mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Subtask not found in this project");
  }

  await SubTask.findByIdAndDelete(subTaskId);

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
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
