import sendEmails from "../../utils/emails.js";
import generateUniqueCode from "../../utils/generateCode.js";
import User from "../user/user.model.js";
import WebhookEvent from "../webhooks/webhook.model.js";
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
    const gameOwnerId = req.body.owner_id;
    const playersReceived = req.body.players
    
    // Obtener los emails de los jugadores para consultar la base de datos
    const emails = playersReceived.map((player) => player.email);
    const existingUsers = await User.find({ email: { $in: emails } });

     // Filtrar existingUsers para excluir al creador del juego
     const existingUsersButOwner = existingUsers.filter(
      (user) => user._id.toString() !== gameOwnerId
    );
    // Crear un mapa con email como clave y _id como valor
    const userMap = existingUsers.reduce((acc, user) => {
      acc[user.email] = user._id;
      return acc;
    }, {});

    const players = playersReceived.map((player) => {
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
    for (const user of existingUsersButOwner) {
      user.played_games.push(game._id);
      await user.save();
    }
    await sendEmailsToPlayers(game.players, game_code, game.game_name);
    return res
      .status(200)
      .json({ message: "Juego creado correctamente", game });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

async function sendEmailsToPlayers(gamePlayers, gameCode, gameName) {
  for (const player of gamePlayers) {
    try {
      console.log("Enviando correo a:", player);
      const destinatario = player.email;
      const asunto = gameName;
      const mensaje = `Hola ${player.player_name},\n\nHas sido incluido en el Amigo Invisible: "${gameName}".\n\nTu código de acceso es: ${gameCode}${player.player_code}\n\n¡Entra en nuestra app y usa el código para ver con quién te ha unido el azar!`;
      await sendEmails(
        destinatario,
        asunto,
        mensaje,
        gameCode,
        player.player_code
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      // results.push({ email: destinatario, ...emailResult });
    } catch (error) {
      console.error("Error enviando correo a:", player.email, error);
    }
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
    // Obtener los eventos más recientes para cada combinación de gameCode y playerCode
    const webhookEvents = await WebhookEvent.aggregate([
      { $match: { gameCode: gameCode } },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: { gameCode: "$gameCode", playerCode: "$playerCode" },
          event: { $first: "$event" },
          email: { $first: "$email" },
          createdAt: { $first: "$createdAt" },
          reason: { $first: "$reason" }
        }
      }
    ]);
  
    // Preparamos un diccionario { playerCode: status }
    const statusByPlayer = {};
    webhookEvents.forEach((event) => {
     
      const code = event._id.playerCode;
      if (event.event == "delivered") {
        statusByPlayer[code] = "delivered";
      } else if (event.event == "dropped" || event.event == "bounce") {
        statusByPlayer[code] = "failed";
      }
    });
  
    const filteredPlayers = game.players
      .filter((player) => player.player_code !== matchedPlayer.player_code)
      .map(({ linked_to, ...rest }) =>({
        ...rest,
        mail_status: statusByPlayer[rest.player_code] || "pending",
      }));

    return res.status(200).json({
      ...game,
      players: filteredPlayers,
      matched_player: matchedPlayer.linked_to,
      current_player: matchedPlayer.player_name,

      
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

const sendRoomEmail = async (req, res) => {
  try {
    const { gameId } = req.body;
    const { playerId } = req.body;
    const { playerEmail } = req.body;
    if (!gameId || !playerId) {
      return res
        .status(400)
        .json({ message: "gameId y playerId son requeridos" });
    }

    const game = await Room.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    const player = game.players.find(
      (player) => player._id.toString() === playerId
    );
    if (!player) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }
    //Si se manda un nuevo email, sustituirlo en el jugador de esa sala
    if (playerEmail != player.email) {
      player.email = playerEmail;
      game.players.find((player) => player._id.toString() === playerId).email =
        playerEmail;
    }
    await game.save();
    const emailResults = await sendEmailsToPlayers(
      [player],
      game.game_code,
      game.game_name
    );
    return res.status(200).json({ message: "Email enviados", emailResults });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error al enviar correo" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { gameId } = req.params;
    const {userId} = req.query;
    const gameToDelete = await Room.findByIdAndDelete(gameId);
    if (!gameToDelete) {
      return res.status(404).json({ message: "Juego no encontrado" });
    } 
    if (userId != gameToDelete.owner_id.toString()) {
      return res.status(403).json({ message: "No tienes permiso para borrar este juego" });
    }
    else {
      // Eliminar el ID del juego eliminado del array owned_games del propietario
      await deleteRoomFromOwnerArray(gameToDelete);
      // Eliminar el ID del juego eliminado del array played_games de los jugadores
      await deleteRoomFromPlayersArray(gameToDelete);
      return res.status(200).json({ message: "Juego borrado" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error al borrar juego" });
  }
};

async function deleteRoomFromOwnerArray(gameToDelete) {
  try {
    const owner = await User.findById(gameToDelete.owner_id);
    if (owner) {
      owner.owned_games = owner.owned_games.filter(
        (gameId) => gameId.toString() !== gameToDelete._id.toString()
      );
      await owner.save();
    }
  } catch (err) {
    console.error("Error in deleteRoomFromOwnerArray:", err);
  }
}

async function deleteRoomFromPlayersArray(gameToDelete) {
  try {
    const playerIds = gameToDelete.players.map((player) => player._id);
    const players = await User.find({ _id: { $in: playerIds } });
    for (const player of players) {
      player.played_games = player.played_games.filter(
        (gameId) => gameId.toString() !== gameToDelete._id.toString()
      );
      await player.save();
    }
  } catch (err) {
    console.error("Error in deleteRoomFromPlayersArray:", err);
  }
}

export default {
  getAllRooms,
  createRoom,
  findRoomByAccessCode,
  updateRoom,
  deleteRoom,
  sendRoomEmail,
};
