import Room from "../room/room.model.js";
import User from "./user.model.js";

const logUser = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      user.logged = true;
      await user.save();
      return res
        .status(200)
        .json({
          user_name: user.name,
          user_email: user.email,
          user_id: user._id,
        });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const createUser = async (req, res) => {
  try {
    const { email } = req.body;
    // Buscar juegos que contengan el email del usuario en el array players
    const rooms = await Room.find({ "players.email": email });

    // Obtener los IDs de los juegos encontrados
    const playedGamesIds = rooms.map((room) => room._id);

    // Crear el nuevo usuario con los IDs de los juegos en el array played_games
    const user = new User({ ...req.body, played_games: playedGamesIds });
    await user.save();

    return res.status(200).json({ message: "Usuario creado", user: user });
  } catch (err) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getUserRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId }).populate([
      { path: "owned_games" },
      { path: "played_games" },
    ]);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res
      .status(200)
      .json({ owned_games: user.owned_games, played_games: user.played_games });
  } catch (err) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
export default { logUser, createUser, getUserRooms };
