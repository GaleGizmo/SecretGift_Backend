import express from 'express';
import roomController from './room.controller.js';
const roomsRoutes = express.Router();

roomsRoutes.post('/create', roomController.createRoom);
roomsRoutes.get('/:accesCode', roomController.findRoomByAccessCode);
roomsRoutes.get('/', roomController.findRoomByAccessCode);
roomsRoutes.put('/:accesCode', roomController.updateRoom);
roomsRoutes.delete('/:accesCode', roomController.deleteRoom);

export default roomsRoutes;