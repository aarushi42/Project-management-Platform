import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";
import { Mongoose } from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  //test
});

const getProjectById = asyncHandler(async (req, res) => {
  //test
});

const createProject = asyncHandler(async (req, res) => {
  //get name and description from req.body
  const { name, description } = req.body;
  //create project with name, description and owner as req.user.userId
  const project = await Project.create({
    name,
    description,
    createdBy: new Mongoose.Types.ObjectId(req.user._id),
  });
  // create member as the user who created the project with role as owner
  const member = await ProjectMember.create({
    user: new Mongoose.Types.ObjectId(req.user._id),
    project: new Mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  //get the name project id and desc
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description },
    { new: true },
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Project deleted successfully"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  //test
});

const getProjectMembers = asyncHandler(async (req, res) => {
  //test
});

const updateMemberRoles = asyncHandler(async (req, res) => {
  //test
});

const deleteMember = asyncHandler(async (req, res) => {
  //test
});

export {
  addMembersToProject,
  createProject,
  deleteMember,
  getProjects,
  getProjectById,
  getProjectMembers,
  updateMemberRoles,
  updateProject,
  deleteProject,
};
