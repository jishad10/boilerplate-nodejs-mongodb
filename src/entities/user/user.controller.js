import AppError from "../../core/error/appError.js";
import catchAsync from "../../lib/catchAsync.js";
import { generateResponse } from "../../lib/responseFormate.js";
import {
  getAllUsers,
  getAllAdmins,
  getAllSellers,
  getUserById,
  updateUser,
  deleteUser,
  createAvatarProfile,
  updateAvatarProfile,
  deleteAvatarProfile,
  createMultipleAvatar,
  updateMultipleAvatar,
  deleteMultipleAvatar,
  createUserPDF,
  updateUserPDF,
  deleteUserPDF,
  adminGetUserById,
  adminUpdateUser,
  adminDeleteUser,
} from "./user.service.js";


// ─── Admin: Fetch All Users ───────────

export const getAllUsersController = catchAsync(async (req, res) => {
  const { page, limit, search, date } = req.query;
  const { users, paginationInfo } = await getAllUsers({ page, limit, search, date });
  generateResponse(res, 200, true, 'Users fetched successfully', { users, paginationInfo });
});


export const getAllAdminsController = catchAsync(async (req, res) => {
  const { page, limit, search, date } = req.query;
  const { admins, paginationInfo } = await getAllAdmins({ page, limit, search, date });
  generateResponse(res, 200, true, 'Admins fetched successfully', { admins, paginationInfo });
});


export const getAllSelleresController = catchAsync(async (req, res) => {
  const { page, limit, search, date } = req.query;
  const { sellers, paginationInfo } = await getAllSellers({ page, limit, search, date });
  generateResponse(res, 200, true, 'Sellers fetched successfully', { sellers, paginationInfo });
});


// ─── User: Profile ────────────────

export const getUserProfileController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await getUserById(userId);
  generateResponse(res, 200, true, 'User profile fetched successfully', user);
});


export const updateUserProfileController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const updatedUser = await updateUser({ id: userId, ...req.body });
  generateResponse(res, 200, true, 'User profile updated successfully', updatedUser);
});


export const deleteOwnAccountController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  await deleteUser(userId);
  generateResponse(res, 200, true, 'Your account has been deleted', null);
});


// ─── Admin: User Management ──────────────

export const adminGetUserByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await adminGetUserById(id);
  generateResponse(res, 200, true, 'User fetched successfully', user);
});


export const adminUpdateUserController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await adminUpdateUser({ id, ...req.body });
  generateResponse(res, 200, true, 'User updated successfully', updatedUser);
});


export const adminDeleteUserController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await adminDeleteUser(id);
  generateResponse(res, 200, true, 'User deleted successfully', null);
});


// ─── User: Single Avatar ────────────

export const createAvatarController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files?.profileImage) throw new AppError(400, 'Profile image is required');
  const user = await createAvatarProfile(userId, req.files);
  generateResponse(res, 200, true, 'Avatar uploaded successfully', user);
});


export const updateAvatarProfileController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files?.profileImage) throw new AppError(400, 'Profile image is required');
  const user = await updateAvatarProfile(userId, req.files);
  generateResponse(res, 200, true, 'Avatar updated successfully', user);
});


export const deleteAvatarController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const updatedUser = await deleteAvatarProfile(userId);
  generateResponse(res, 200, true, 'Avatar deleted successfully', updatedUser);
});


// ─── User: Multiple Avatars ────────────

export const createMultipleAvatarController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files || Object.keys(req.files).length === 0) throw new AppError(400, 'At least one avatar image is required');
  const user = await createMultipleAvatar(userId, req.files);
  generateResponse(res, 200, true, 'Multiple avatars uploaded successfully', user);
});


export const updateMultipleAvatarController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files || Object.keys(req.files).length === 0) throw new AppError(400, 'At least one avatar image is required');
  const user = await updateMultipleAvatar(userId, req.files);
  generateResponse(res, 200, true, 'Multiple avatars updated successfully', user);
});


export const deleteMultipleAvatarController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files || Object.keys(req.files).length === 0) throw new AppError(400, 'At least one avatar image is required');
  const user = await deleteMultipleAvatar(userId);
  generateResponse(res, 200, true, 'Multiple avatars deleted successfully', user);
});


// ─── User: PDF ──────────────

export const createUserPDFController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files || Object.keys(req.files).length === 0) throw new AppError(400, 'At least one PDF is required');
  const user = await createUserPDF(userId, req.files);
  generateResponse(res, 200, true, 'PDF uploaded successfully', user);
});


export const updateUserPDFController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  if (!req.files || Object.keys(req.files).length === 0) throw new AppError(400, 'At least one PDF is required');
  const user = await updateUserPDF(userId, req.files);
  generateResponse(res, 200, true, 'PDF updated successfully', user);
});


export const deleteUserPDFController = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await deleteUserPDF(userId);
  generateResponse(res, 200, true, 'PDF deleted successfully', user);
});