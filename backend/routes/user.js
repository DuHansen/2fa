const express = require('express');
const UserApi = require('../api/user');
const authMiddleware = require('../middleware/auth');
const user = require('../model/user');

const userRouter = express.Router();

userRouter.post('/login',  UserApi.login);
userRouter.get('/', authMiddleware(), UserApi.findUser);
userRouter.post('/', UserApi.createUser);
userRouter.put('/:id', authMiddleware(), UserApi.updateUser);
userRouter.delete('/:id', UserApi.deleteUser);
userRouter.post('/validarcodigo', UserApi.validateAccessCode);
userRouter.post('/validartoken', UserApi.tokenValidate);

module.exports = userRouter;