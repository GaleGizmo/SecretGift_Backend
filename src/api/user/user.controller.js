import User from "./user.model.js";

const logUser = async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });}
        if (user.email==userEmail && user.password === userPassword) {
            user.logged = true;
            await user.save();
            return res.status(200).json({ message: "Usuario logado", user_name: user.name, user_email: user.email, user_id: user._id });
           
        } else {
            return res.status(404).json({ message: "Usuario o contraseña incorrectas" });
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
            path: "owned_rooms",
            select: "-players.linked_to" // Excluye el campo linked_to de players
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.status(200).json({ message: "Salas encontradas", rooms: user.owned_rooms });
    } catch (err) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
}
export default { logUser, createUser, getUserRooms };