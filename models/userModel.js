const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    trim: true,
    maxlength: [30, 'Username must have less or equal than 30 characters'],
    minlength: [3, 'Username must have more or equal than 3 characters']
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    lowercase: true,
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must have more or equal than 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password is required'],
    validate: {
      // Works only on create and save. Doesn't work with findOneAndUpdate
      validator: function (confirm) {
        return confirm === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {
  // only runs the function if the password was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm field because we don't need it anymore. It will not be persisted to database
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  requestPasword,
  userPassword
) {
  return await bcrypt.compare(requestPasword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means password didn't change
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;