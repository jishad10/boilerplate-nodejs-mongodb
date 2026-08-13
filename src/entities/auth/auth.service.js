import User from './auth.model.js';
import jwt from 'jsonwebtoken';
import { refreshTokenSecrete, emailExpires } from '../../core/config/config.js';
import sendEmail from '../../lib/sendEmail.js';
import verificationCodeTemplate from '../../lib/emailTemplates.js';
import AppError from '../../core/error/appError.js';


export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError(400, 'User already registered.');

  const newUser = new User({ name, email, password });
  const user = await newUser.save();

  const { _id, role, profileImage } = user;
  return { _id, name, email, role, profileImage };
};


export const loginUserService = async ({ email, password }) => {
  if (!email || !password) throw new AppError(400, 'Email and password are required');

  const user = await User.findOne({ email }).select('_id firstName lastName email role profileImage');
  if (!user) throw new AppError(404, 'User not found');

  const isMatch = await user.comparePassword(user._id, password);
  if (!isMatch) throw new AppError(400, 'Invalid password');

  const payload = { _id: user._id, role: user.role };

  const data = {
    user,
    accessToken: user.generateAccessToken(payload),
  };

  user.refreshToken = user.generateRefreshToken(payload);
  await user.save({ validateBeforeSave: false });

  return data;
};


export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) throw new AppError(400, 'No refresh token provided');

  const user = await User.findOne({ refreshToken });
  if (!user) throw new AppError(401, 'Invalid refresh token');

  const decoded = jwt.verify(refreshToken, refreshTokenSecrete);
  if (!decoded || decoded._id !== user._id.toString()) throw new AppError(401, 'Invalid refresh token');

  const payload = { _id: user._id, role: user.role };

  const accessToken = user.generateAccessToken(payload);
  const newRefreshToken = user.generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};


export const forgetPasswordService = async (email) => {
  if (!email) throw new AppError(400, 'Email is required');

  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, 'Invalid email');

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = new Date(Date.now() + emailExpires);

  user.otp = otp;
  user.otpExpires = otpExpires;
  user.otpVerified = false;
  user.resetExpires = null;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: 'Password Reset OTP',
    html: verificationCodeTemplate(otp),
  });
};


export const verifyCodeService = async ({ email, otp }) => {
  if (!email || !otp) throw new AppError(400, 'Email and otp are required');

  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, 'Invalid email');

  if (!user.otp || !user.otpExpires) throw new AppError(404, 'Otp not found');

  if (
    parseInt(user.otp, 10) !== parseInt(otp, 10) ||
    Date.now() > user.otpExpires.getTime()
  ) {
    throw new AppError(403, 'Invalid or expired otp');
  }

  user.otp = null;
  user.otpExpires = null;
  user.otpVerified = true;
  user.resetExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({ validateBeforeSave: false });
};


export const resetPasswordService = async ({ email, newPassword }) => {
  if (!email || !newPassword) throw new AppError(400, 'Email and new password are required');

  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, 'Invalid email');

  if (!user.otpVerified || !user.resetExpires) throw new AppError(403, 'OTP not verified');

  if (Date.now() > user.resetExpires.getTime()) throw new AppError(403, 'Reset session expired');

  user.password = newPassword;
  user.otpVerified = false;
  user.resetExpires = null;

  await user.save();
};


export const changePasswordService = async ({ userId, oldPassword, newPassword }) => {
  if (!oldPassword || !newPassword) throw new AppError(400, 'Old and new passwords are required');

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const isMatch = await user.comparePassword(userId, oldPassword);
  if (!isMatch) throw new AppError(400, 'Invalid old password');

  user.password = newPassword;
  await user.save();
};