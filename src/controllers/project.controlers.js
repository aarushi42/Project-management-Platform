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
} from "../utils/mail.js"; //Todo sending email when the user gets added to a project
import { Mongoose } from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  //test
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new Mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$projects",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          createdBy: 1,
          createdAt: 1,
          members: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
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
  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  await ProjectMember.findByIdAndUpdate(
    {
      user: new Mongoose.Types.ObjectId(user._id),
      project: new Mongoose.Types.ObjectId(projectId),
    },
    {
      user: new Mongoose.Types.ObjectId(user._id),
      project: new Mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      upsert: true,
      new: true,
    },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Member added to project successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectmembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new Mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
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
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectmembers,
        "Project members fetched successfully",
      ),
    );
});

const updateMemberRoles = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid role");
  }

  let projectMember = await ProjectMember.findOne({
    project: new Mongoose.Types.ObjectId(projectId),
    user: new Mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project Member not Found");
  }

  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    { role: newRole },
    { new: true },
  );

  if (!projectMember) {
    throw new ApiError(400, "Project Member not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projectMember, "Project Member role updated"));
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new Mongoose.Types.ObjectId(projectId),
    user: new Mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project Member not Found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(400, "Project Member not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project Member deleted successfully",
      ),
    );
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
