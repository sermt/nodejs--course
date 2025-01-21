const express = require('express');
const userRouter = express.Router();
const { getAllUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;