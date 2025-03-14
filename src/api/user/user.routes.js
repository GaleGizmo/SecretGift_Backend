import express from 'express';

import userController from './user.controller.js';
const usersRoutes = express.Router();

const {logUser, createUser, getUserRooms, getOwnedGames, getPlayedGames} = userController;

usersRoutes.post('/login', logUser);
usersRoutes.post('/create', createUser);
usersRoutes.get('/rooms/:userId', getUserRooms);
usersRoutes.get('/owned/:userId', getOwnedGames);
usersRoutes.get('/played/:userId', getPlayedGames);

export default usersRoutes;