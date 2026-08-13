import catchAsync from '../../lib/catchAsync.js';
import { generateResponse } from '../../lib/responseFormate.js';
import User from './auth.model.js';
import {
  loginUserService,
  refreshAccessTokenService,
  forgetPasswordService,
  verifyCodeService,
  resetPasswordService,
  changePasswordService,
  registerUserService
} from './auth.service.js';


export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const data = await registerUserService({ name, email, password });
  generateResponse(res, 201, true, 'Registered user successfully!', data);
});


export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginUserService({ email, password });
  generateResponse(res, 200, true, 'Login successful', data);
});


export const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await refreshAccessTokenService(refreshToken);
  generateResponse(res, 200, true, 'Token refreshed', tokens);
});


export const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await forgetPasswordService(email);
  generateResponse(res, 200, true, 'Verification code sent to your email', null);
});


export const verifyCode = catchAsync(async (req, res) => {
  const { otp, email } = req.body;
  await verifyCodeService({ otp, email });
  generateResponse(res, 200, true, 'Verification successful', null);
});


export const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;
  await resetPasswordService({ email, newPassword });
  generateResponse(res, 200, true, 'Password reset successfully', null);
});


export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;
  await changePasswordService({ userId, oldPassword, newPassword });
  generateResponse(res, 200, true, 'Password changed successfully', null);
});


export const logoutUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  generateResponse(res, 200, true, 'Logged out successfully', null);
});