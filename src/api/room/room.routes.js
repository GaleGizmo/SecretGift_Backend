import express from 'express';
import roomController from './room.controller.js';
const roomsRoutes = express.Router();

roomsRoutes.get('/getallrooms', roomController.getAllRooms);
roomsRoutes.post('/create', roomController.createRoom);
roomsRoutes.get('/:accessCode', roomController.findRoomByAccessCode);
roomsRoutes.get('/', roomController.findRoomByAccessCode);
roomsRoutes.put('/:accessCode', roomController.updateRoom);
roomsRoutes.delete('/:gameId', roomController.deleteRoom);

export default roomsRoutes;