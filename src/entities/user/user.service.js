import { createFilter, createPaginationInfo } from "../../lib/pagination.js";
import { cloudinaryUpload, cloudinaryDelete } from "../../lib/cloudinaryUpload.js";
import User from "../auth/auth.model.js";
import RoleType from "../../lib/types.js";
import AppError from "../../core/error/appError.js";


// ─── Reusable Constants ──────────────

const USER_SELECT = "-password -createdAt -updatedAt -__v -verificationCode -verificationCodeExpires";


// ─── Reusable Helpers ────────────────

const findUserOrThrow = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

const sanitizeTitle = (name, suffix = "") =>
  `${name.toLowerCase().replace(/\s+/g, "-").replace(/[?&=]/g, "")}${suffix}`;


// ─── Admin: Fetch All Users ────────────

export const getAllUsers = async ({ page = 1, limit = 10, search, date }) => {
  const filter = { ...createFilter(search, date), role: RoleType.USER };
  const totalUsers = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select(USER_SELECT)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { users, paginationInfo: createPaginationInfo(page, limit, totalUsers) };
};


export const getAllAdmins = async ({ page = 1, limit = 10, search, date }) => {
  const filter = { ...createFilter(search, date), role: RoleType.ADMIN };
  const totalAdmins = await User.countDocuments(filter);
  const admins = await User.find(filter)
    .select(USER_SELECT)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { admins, paginationInfo: createPaginationInfo(page, limit, totalAdmins) };
};


export const getAllSellers = async ({ page = 1, limit = 10, search, date }) => {
  const filter = { ...createFilter(search, date), role: RoleType.SELLER };
  const totalSellers = await User.countDocuments(filter);
  const sellers = await User.find(filter)
    .select(USER_SELECT)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { sellers, paginationInfo: createPaginationInfo(page, limit, totalSellers) };
};


// ─── User: Profile ─────────────────────

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select(USER_SELECT);
  if (!user) throw new AppError(404, 'User not found');
  return user;
};


export const updateUser = async ({ id, ...updateData }) => {
  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .select(USER_SELECT);
  if (!updatedUser) throw new AppError(404, 'User not found');
  return updatedUser;
};


export const deleteUser = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new AppError(404, 'User not found');
  return true;
};


// ─── Admin: User Management ────────────────

export const adminGetUserById = async (userId) => {
  const user = await User.findById(userId).select(USER_SELECT);
  if (!user) throw new AppError(404, 'User not found');
  return user;
};


export const adminUpdateUser = async ({ id, ...updateData }) => {
  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .select(USER_SELECT);
  if (!updatedUser) throw new AppError(404, 'User not found');
  return updatedUser;
};


export const adminDeleteUser = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new AppError(404, 'User not found');
  return true;
};


// ─── User: Single Avatar ────────────────────

export const createAvatarProfile = async (id, files) => {
  const user = await findUserOrThrow(id);

  const result = await cloudinaryUpload(
    files.profileImage[0].path,
    `${user._id}-${Date.now()}`,
    "user-profile"
  );

  const updatedUser = await User.findByIdAndUpdate(id, { profileImage: result.url }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


export const updateAvatarProfile = async (id, files) => {
  const user = await findUserOrThrow(id);
  if (!files?.profileImage?.length) throw new AppError(400, 'Profile image is required');

  if (user.profileImage) await cloudinaryDelete(user.profileImage);

  const result = await cloudinaryUpload(
    files.profileImage[0].path,
    sanitizeTitle(user.fullName || "user"),
    "user-profile"
  );

  const updatedUser = await User.findByIdAndUpdate(id, { profileImage: result.url }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


export const deleteAvatarProfile = async (id) => {
  const user = await findUserOrThrow(id);
  if (!user.profileImage) throw new AppError(400, 'No profile image to delete');

  await cloudinaryDelete(user.profileImage);

  const updatedUser = await User.findByIdAndUpdate(id, { profileImage: '' }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


// ─── User: Multiple Avatars ────────────────────

export const createMultipleAvatar = async (id, files) => {
  const user = await findUserOrThrow(id);
  if (!files?.multiProfileImage?.length) throw new AppError(400, 'Profile images are required');

  const imageUrls = await Promise.all(
    files.multiProfileImage.map((image, index) =>
      cloudinaryUpload(
        image.path,
        sanitizeTitle(user.fullName, `-${index}`),
        "user-profile"
      ).then((r) => r.url)
    )
  );

  const updatedUser = await User.findByIdAndUpdate(id, { multiProfileImage: imageUrls }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


export const updateMultipleAvatar = async (id, files) => {
  const user = await findUserOrThrow(id);
  if (!files?.multiProfileImage?.length) throw new AppError(400, 'Profile images are required');

  // Delete old images from Cloudinary first
  if (user.multiProfileImage?.length) {
    await Promise.all(user.multiProfileImage.map((url) => cloudinaryDelete(url)));
  }

  const imageUrls = await Promise.all(
    files.multiProfileImage.map((image, index) =>
      cloudinaryUpload(
        image.path,
        sanitizeTitle(user.fullName, `-${index}`),
        "user-profile"
      ).then((r) => r.url)
    )
  );

  const updatedUser = await User.findByIdAndUpdate(id, { multiProfileImage: imageUrls }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


export const deleteMultipleAvatar = async (id) => {
  const user = await findUserOrThrow(id);
  if (!user.multiProfileImage?.length) throw new AppError(400, 'No profile images to delete');

  await Promise.all(user.multiProfileImage.map((url) => cloudinaryDelete(url)));

  const updatedUser = await User.findByIdAndUpdate(id, { multiProfileImage: [] }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


// ─── User: PDF ────────────────────────

export const createUserPDF = async (id, files) => {
  const user = await findUserOrThrow(id);
  if (!files?.userPDF?.length) throw new AppError(400, 'PDF file is required');

  const result = await cloudinaryUpload(
    files.userPDF[0].path,
    sanitizeTitle(user.fullName),
    "user-pdf"
  );

  const updatedUser = await User.findByIdAndUpdate(id, { pdfFile: result.url }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


export const updateUserPDF = async (id, files) => {
  const user = await findUserOrThrow(id);
  if (!files?.userPDF?.length) throw new AppError(400, 'PDF file is required');

  if (user.pdfFile) await cloudinaryDelete(user.pdfFile);

  const result = await cloudinaryUpload(
    files.userPDF[0].path,
    sanitizeTitle(user.fullName),
    "user-pdf"
  );

  const updatedUser = await User.findByIdAndUpdate(id, { pdfFile: result.url }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};


export const deleteUserPDF = async (id) => {
  const user = await findUserOrThrow(id);
  if (!user.pdfFile) throw new AppError(400, 'No PDF file to delete');

  await cloudinaryDelete(user.pdfFile);

  const updatedUser = await User.findByIdAndUpdate(id, { pdfFile: null }, { new: true })
    .select(USER_SELECT);

  return updatedUser;
};