const userModel = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const dotenv = require('dotenv');
const sendEmail = require('../utils/mailer');
const crypto = require('crypto');

dotenv.config({ path: './config.env' });
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });
};

// POST /api/v1/auth/signup
const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const user = await userModel.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }

  const user = await userModel.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }
  user.password = undefined; // Remove password from response
  const cookieOptions = {
    secure: false,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // Sign token and send it in response cookie
  const token = signToken(user._id);

  res.cookie('token', token, {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIETIME * 24 * 60 * 60 * 1000
    ),
    cookieOptions,
  });

  res.json({
    status: 'success',
    data: { user },
  });

});

const protect = catchAsync(async function protect(req, _, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in.', 401));
  }

  // Check if token is valid
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  if(req.params.id !== decoded.id) {
    return next(new AppError('Unauthorized to access this route', 403));
  }
  
  // check if user has changed password after token was issued
  if (user.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User has recently changed password. Please log in again.',
        401
      )
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized to access this route', 403));
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user by email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email'), 404);
  }

  // generate random token
  const resetToken = user.createPasswordResetToken();
  console.log('Reset token:', resetToken);
  await user.save({ validateBeforeSave: false });

  // send email with reset token
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Reset your password: ${resetUrl}.\nIf you didn't request this, please ignore this email.`;

  const mailOptions = {
    from: '"Node course" <exampleEmail00@example.com>',
    to: 'example@example.com',
    subject: 'Email test',
    text: `${message} \n\nThis link expires in 10 minutes.`,
    html: '<b>Test</b>',
  };

  try {
    await sendEmail(mailOptions);
    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent. Check your inbox.',
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // Get user by reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('Hashed token:', hashedToken);

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token or token expired'), 400);
  }

  const { password, passwordConfirm } = req.body;
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }
  // Set new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();

  // Sign in the user
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password reset successful. You can now log in.',
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await userModel.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Incorrect current password', 401));
  }

  // Check if new passwords match
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Set new password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  // Sign in the user
  const token = signToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
    message: 'Password updated successfully. You can now log in.',
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email'];

  if (!allowedUpdates.every((update) => updates.includes(update))) {
    return next(new AppError('Invalid updates', 400));
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully.',
    });
  } catch (error) {
    next(new AppError('Error updating user', 400));
  }
});

const deleteMe = catchAsync(async (req, res, next) => {
  try {
    // Delete password and other sensitive data
    await userModel.findByIdAndUpdate(req.user._id, { isActive: false });
    res.status(204).json({
      status: 'success',
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(new AppError('Error deleting user', 400));
  }
});
module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe,
};
