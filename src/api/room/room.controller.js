
import Room from "./room.model.js";
import  { nanoid } from "nanoid";

const createRoom = async (req, res) => {
    try {
      const room_code = nanoid(4);
      const players = req.body.players.map(player => ({
        ...player,
        player_code: nanoid(4)
      }));
  
      const room = new Room({ ...req.body, room_code, players });
      await room.save();
  
      return res.status(200).json({ message: 'Room created', room });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server error', error: err });
    }
  };

async function findRoomByAccessCode(req, res) {
    try {
      const { accesCode } = req.params;
      const room = await Room.findOne({ "players.player_code": { $exists: true } }).lean();
  
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
  
      const matchedPlayer = room.players.find(
        (player) => `${room.room_code}${player.player_code}` === accesCode
      );
  
      if (!matchedPlayer) {
        return res.status(404).json({ message: "Invalid access code" });
      }
  
      const filteredPlayers = room.players.map((player) =>
        player.player_code === matchedPlayer.player_code ? null : { name: player.name }
      ).filter(player => player !== null);
  
      res.status(200).json({
        ...room,
        players: filteredPlayers,
        matched_player: matchedPlayer
      });
  
      res.status(200).json({ ...room, players: filteredPlayers });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
  

const updateRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await Room.findOneAndUpdate({ room_code: roomCode }, req.body, { new: true });
        return res.status(200).json({ message: 'Room updated', room: room });
    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: 'Room not found' });
    }
}

const deleteRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        await Room.findOneAndDelete({ room_code: roomCode });
        return res.status(200).json({ message: 'Room deleted' });
    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: 'Room not found' });
    }
}

export default { createRoom, findRoomByAccessCode, updateRoom, deleteRoom };