import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    logged: { type: Boolean, default: false },
    owned_rooms: [{ type: mongoose.Types.ObjectId, ref: "room" }],
    played_rooms: [{ type: mongoose.Types.ObjectId, ref: "room" }],
  
},
{
    timestamps: true,
    collection: "user",
});

const User = mongoose.model("user", UserSchema);
export default User;