import express from 'express';

import userController from './user.controller.js';
const usersRoutes = express.Router();



usersRoutes.post('/login', userController.logUser);
usersRoutes.post('/create', userController.createUser);
usersRoutes.get('/rooms/:userId', userController.getUserRooms);
usersRoutes.get('/owned/:userId', userController.getOwnedGames);
usersRoutes.get('/played/:userId', userController.getPlayedGames);
usersRoutes.patch('/edituser/:userId', userController.editUser);
usersRoutes.delete('/deleteuser/:userId', userController.deleteUser);

export default usersRoutes;