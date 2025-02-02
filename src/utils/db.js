import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DB_ACCESS = process.env.DB_URL


const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(DB_ACCESS);
    const { host } = db.connection;
    console.log("conexión exitosa en el host:" + host);
  } catch (error) {
    console.log("no se puede conectar a la base de datos, melón ->>", error);
  }
};

export default { connectDB };