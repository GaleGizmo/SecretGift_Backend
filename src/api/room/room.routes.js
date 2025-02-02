import express from 'express';
import roomController from './room.controller.js';
const roomsRoutes = express.Router();

roomsRoutes.post('/create', roomController.createRoom);
roomsRoutes.get('/:roomCode', roomController.findRoomByAccessCode);
roomsRoutes.put('/:roomCode', roomController.updateRoom);
roomsRoutes.delete('/:roomCode', roomController.deleteRoom);

export default roomsRoutes;