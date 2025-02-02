import User from "./user.model.js";

const logUser = async (req, res) => {
    try {
        const { userId, userPassword } = req.body;
        const user = await User.findById(userId);
        if (user && user.password === userPassword) {
            user.logged = true;
            await user.save();
            return res.status(200).json({ message: "Usuario logado", user: user });
           
        } else {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (err) {
        console.log(err);
    }   
}

const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        return res.status(200).json({ message: "Usuario creado", user: user });
    } catch (err) {
        console.log(err);
    }
}

export default { logUser, createUser };