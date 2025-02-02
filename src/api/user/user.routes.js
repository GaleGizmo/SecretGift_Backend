import express from 'express';

import userController from './user.controller.js';
const usersRoutes = express.Router();

const {logUser, createUser} = userController;

usersRoutes.post('/login', logUser);
usersRoutes.post('/create', createUser);
usersRoutes.get('/rooms/:userId', userController.getUserRooms);

export default usersRoutes;