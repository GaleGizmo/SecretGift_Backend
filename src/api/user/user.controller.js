import User from "./user.model.js";

const logUser = async (req, res) => {
    try {
        const { userEmail } = req.body;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });}
            else {
                user.logged = true;
                await user.save();
                return res.status(200).json({  user_name: user.name, user_email: user.email, user_id: user._id });
            }
        
        
    } catch (err) {
        return res.status(500).json({ message: "Error en el servidor" });
       
    }   
}

const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        return res.status(200).json({ message: "Usuario creado", user: user });
    } catch (err) {
        return res.status(500).json({ message: "Error en el servidor" });
       
    }
}

const getUserRooms = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ _id: userId }).populate({
            path: "owned_games",
            select: "-players.linked_to" // Excluye el campo linked_to de players
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.status(200).json({ message: "Salas encontradas", owned_games: user.owned_games });
    } catch (err) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
}
export default { logUser, createUser, getUserRooms };