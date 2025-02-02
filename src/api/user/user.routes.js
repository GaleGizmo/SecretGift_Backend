import express from 'express';

import userController from './user.controller.js';
const usersRoutes = express.Router();

const {logUser, createUser} = userController;

usersRoutes.post('/login', logUser);
usersRoutes.post('/create', createUser);

export default usersRoutes;