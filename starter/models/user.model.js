const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
});

userSchema.pre('save', async function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  if (this.isModified('password')) {
    this.passwordChangedAt = new Date();
    // check if the user has changed their password after the last password change
    if (
      this.passwordChangedAt &&
      this.changePasswordAfter(this.passwordChangedAt)
    ) {
      throw new Error(
        'Password has already been changed. Please log in again.'
      );
    }
  }

  // remove passwordConfirm field before saving to the database
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('/^find', function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changePasswordAfter = function (JWTTIMESTAMP) {
  if (!this.passwordChangedAt) return false;
  const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return JWTTIMESTAMP < changeTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
