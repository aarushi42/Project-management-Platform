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

const getProjects = asyncHandler(async (req, res) => {
  //test
});

const getProjectById = asyncHandler(async (req, res) => {
  //test
});

const createProject = asyncHandler(async (req, res) => {
  //test
});

const updateProject = asyncHandler(async (req, res) => {
  //test
});

const deleteProject = asyncHandler(async (req, res) => {
  //test
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
