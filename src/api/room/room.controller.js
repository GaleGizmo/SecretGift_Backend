import sendEmails from "../../utils/emails.js";
import generateUniqueCode from "../../utils/generateCode.js";
import User from "../user/user.model.js";
import Room from "./room.model.js";
import { nanoid } from "nanoid";

const getAllRooms = async (req, res) => {
  try {
    const games = await Room.find();
    return res.status(200).json({ games });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const createRoom = async (req, res) => {
  try {
    const game_code = await generateUniqueCode();
    const usedCodes = new Set();

    // Obtener los emails de los jugadores para consultar la base de datos
    const emails = req.body.players.map((player) => player.email);
    const existingUsers = await User.find({ email: { $in: emails } });

    // Crear un mapa con email como clave y _id como valor
    const userMap = existingUsers.reduce((acc, user) => {
      acc[user.email] = user._id;
      return acc;
    }, {});

    const players = req.body.players.map((player) => {
      let player_code;
      do {
        player_code = nanoid(4);
      } while (usedCodes.has(player_code)); // Reintentar si ya existe el código en este juego

      usedCodes.add(player_code); // Registrar el código generado

      return {
        _id: userMap[player.email] || undefined, // Si el email existe, usar su _id; si no, dejar que Mongo genere uno
        ...player,
        player_code,
      };
    });
    const game = new Room({ ...req.body, game_code, players });
    await game.save();

    // Añadir el ID del juego creado al array owned_games del propietario
    const owner = await User.findById(req.body.owner_id);
    if (owner) {
      owner.owned_games.push(game._id);
      await owner.save();
    }

    // Añadir el ID del juego creado al array played_games de los jugadores existentes
    for (const user of existingUsers) {
      user.played_games.push(game._id);
      await user.save();
    }
   await sendEmailsToPlayers(game);
    return res.status(200).json({ message: "Game created", game });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

async function sendEmailsToPlayers(game) {
  for (player of game.players) {
    const destinatario = player.email;
    const asunto = "¡Amigo Invisible!";
    const mensaje = `Hola ${player.player_name},\n\nHas sido incluido en el Amigo Invisible: "${game.name}".\n\nTu código de acceso es: ${game.game_code}${player.player_code}\n\n¡Entra en nuestra app y usa el código para ver con quién te ha unido el azar!`;
    await sendEmails(destinatario, asunto, mensaje);
  }
}

async function findRoomByAccessCode(req, res) {
  try {
    const accessCode = req.params.accessCode || req.query.accessCode;

    if (!accessCode) {
      return res.status(400).json({ message: "Access code is required" });
    }
    //Coge los 4 primeros caracteres del accessCode
    const gameCode = accessCode.slice(0, 4);

    // Buscar la sala que contenga el código del juego correcto
    const game = await Room.findOne({ game_code: gameCode }).lean();

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Buscar el jugador cuyo código coincida
    const matchedPlayer = game.players.find(
      (player) => `${game.game_code}${player.player_code}` === accessCode
    );

    if (!matchedPlayer) {
      return res.status(404).json({ message: "Invalid access code" });
    }

    // Filtrar jugadores sin exponer player_code
    const filteredPlayers = game.players
      .filter((player) => player.player_code !== matchedPlayer.player_code)
      .map(({ linked_to, ...rest }) => rest);

    return res.status(200).json({
      ...game,
      players: filteredPlayers,
      matched_player: matchedPlayer.linked_to,
      current_player: matchedPlayer.player_name,

      // Evita exponer player_code
    });
  } catch (error) {
    console.error("Error in findRoomByAccessCode:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

const updateRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOneAndUpdate(
      { game_code: roomCode },
      req.body,
      { new: true }
    );
    return res.status(200).json({ message: "Game updated", room: room });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Game not found" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    await Room.findOneAndDelete({ game_code: roomCode });
    return res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Room not found" });
  }
};

// const seedRooms = async () => {
//     try {
//       await Room.insertMany([

//             {
//               "name": "Amigo Invisible 2024",
//               "owner_id": "60d5f9e8c2b9f632ac0f1a1a",
//               "average_cost": 25,
//               "status": "active",
//               "room_code": "AB12",
//               "players": [
//                 {
//                   "name": "Juan",
//                   "email": "juan@example.com",
//                   "linked_to": "Maria",
//                   "player_code": "XY34"
//                 },
//                 {
//                   "name": "Maria",
//                   "email": "maria@example.com",
//                   "linked_to": "Pedro",
//                   "player_code": "CD56"
//                 },
//                 {
//                   "name": "Pedro",
//                   "email": "pedro@example.com",
//                   "linked_to": "Luis",
//                   "player_code": "EF78"
//                 }
//               ],
//               "rules": [
//                 {
//                   "player_1": "Juan",
//                   "player_2": "Maria"
//                 },
//                 {
//                   "player_1": "Maria",
//                   "player_2": "Pedro"
//                 }
//               ]
//             },
//             {
//               "name": "Intercambio de Regalos",
//               "owner_id": "60d5f9e8c2b9f632ac0f1a1b",
//               "average_cost": 30,
//               "status": "active",
//               "room_code": "GH90",
//               "players": [
//                 {
//                   "name": "Ana",
//                   "email": "ana@example.com",
//                   "linked_to": "Carlos",
//                   "player_code": "IJ12"
//                 },
//                 {
//                   "name": "Carlos",
//                   "email": "carlos@example.com",
//                   "linked_to": "Sofia",
//                   "player_code": "KL34"
//                 },
//                 {
//                   "name": "Sofia",
//                   "email": "sofia@example.com",
//                   "linked_to": "Ana",
//                   "player_code": "MN56"
//                 }
//               ],
//               "rules": [
//                 {
//                   "player_1": "Ana",
//                   "player_2": "Carlos"
//                 }
//               ]
//             },
//             {
//               "name": "Fiesta de Fin de Año",
//               "owner_id": "60d5f9e8c2b9f632ac0f1a1c",
//               "average_cost": 50,
//               "status": "finished",
//               "room_code": "OP78",
//               "players": [
//                 {
//                   "name": "Luis",
//                   "email": "luis@example.com",
//                   "linked_to": "Elena",
//                   "player_code": "QR90"
//                 },
//                 {
//                   "name": "Elena",
//                   "email": "elena@example.com",
//                   "linked_to": "Roberto",
//                   "player_code": "ST12"
//                 },
//                 {
//                   "name": "Roberto",
//                   "email": "roberto@example.com",
//                   "linked_to": "Luis",
//                   "player_code": "UV34"
//                 }
//               ],
//               "rules": [
//                 {
//                   "player_1": "Luis",
//                   "player_2": "Elena"
//                 },
//                 {
//                   "player_1": "Roberto",
//                   "player_2": "Luis"
//                 }
//               ]
//             }

//       ]);
//       console.log("Datos insertados correctamente");
//     } catch (error) {
//       console.error("Error insertando datos:", error);
//     }
//   };

//   seedRooms();

export default {
  getAllRooms,
  createRoom,
  findRoomByAccessCode,
  updateRoom,
  deleteRoom,
};
