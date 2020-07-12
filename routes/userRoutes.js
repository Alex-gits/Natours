const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:resetToken', resetPassword);
router.patch('/update-password', protect, updatePassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
