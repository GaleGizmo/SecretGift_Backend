
import generateUniqueCode from "../../utils/generateCode.js";
import Room from "./room.model.js";
import  { nanoid } from "nanoid";

const createRoom = async (req, res) => {
    try {
      const room_code = await generateUniqueCode();
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
        const accesCode = req.params.accesCode || req.query.accesCode; 
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
        player.player_code === matchedPlayer.player_code ? null : { name: player.player_name }
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

const seedRooms = async () => {
    try {
      await Room.insertMany([
        
            {
              "name": "Amigo Invisible 2024",
              "owner_id": "60d5f9e8c2b9f632ac0f1a1a",
              "average_cost": 25,
              "status": "active",
              "room_code": "AB12",
              "players": [
                {
                  "name": "Juan",
                  "email": "juan@example.com",
                  "linked_to": "Maria",
                  "player_code": "XY34"
                },
                {
                  "name": "Maria",
                  "email": "maria@example.com",
                  "linked_to": "Pedro",
                  "player_code": "CD56"
                },
                {
                  "name": "Pedro",
                  "email": "pedro@example.com",
                  "linked_to": "Luis",
                  "player_code": "EF78"
                }
              ],
              "rules": [
                {
                  "player_1": "Juan",
                  "player_2": "Maria"
                },
                {
                  "player_1": "Maria",
                  "player_2": "Pedro"
                }
              ]
            },
            {
              "name": "Intercambio de Regalos",
              "owner_id": "60d5f9e8c2b9f632ac0f1a1b",
              "average_cost": 30,
              "status": "active",
              "room_code": "GH90",
              "players": [
                {
                  "name": "Ana",
                  "email": "ana@example.com",
                  "linked_to": "Carlos",
                  "player_code": "IJ12"
                },
                {
                  "name": "Carlos",
                  "email": "carlos@example.com",
                  "linked_to": "Sofia",
                  "player_code": "KL34"
                },
                {
                  "name": "Sofia",
                  "email": "sofia@example.com",
                  "linked_to": "Ana",
                  "player_code": "MN56"
                }
              ],
              "rules": [
                {
                  "player_1": "Ana",
                  "player_2": "Carlos"
                }
              ]
            },
            {
              "name": "Fiesta de Fin de Año",
              "owner_id": "60d5f9e8c2b9f632ac0f1a1c",
              "average_cost": 50,
              "status": "finished",
              "room_code": "OP78",
              "players": [
                {
                  "name": "Luis",
                  "email": "luis@example.com",
                  "linked_to": "Elena",
                  "player_code": "QR90"
                },
                {
                  "name": "Elena",
                  "email": "elena@example.com",
                  "linked_to": "Roberto",
                  "player_code": "ST12"
                },
                {
                  "name": "Roberto",
                  "email": "roberto@example.com",
                  "linked_to": "Luis",
                  "player_code": "UV34"
                }
              ],
              "rules": [
                {
                  "player_1": "Luis",
                  "player_2": "Elena"
                },
                {
                  "player_1": "Roberto",
                  "player_2": "Luis"
                }
              ]
            }
          
          
      ]);
      console.log("Datos insertados correctamente");
    } catch (error) {
      console.error("Error insertando datos:", error);
    }
  };
  
//   seedRooms();

export default { createRoom, findRoomByAccessCode, updateRoom, deleteRoom };