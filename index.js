import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";

const server = express();
const PORT = process.env.PORT;

server.use(cors())

server.use(express.json())
server.use(express.urlencoded({extended:true}))
// Importar rutas usando ES Modules
import roomsRoutes from "./src/api/room/room.routes.js";
import usersRoutes from "./src/api/user/user.routes.js";
import webhookRoutes from "./src/api/webhooks/webhook.routes.js";

server.use("/room", roomsRoutes);
server.use("/user", usersRoutes);
server.use("/webhook", webhookRoutes);

// Importar la conexión a la base de datos
import db from "./src/utils/db.js";

server.use("/room",roomsRoutes)

server.use("/user", usersRoutes)

db.connectDB()
server.use("/", (req, res) => {
  res.send("its alive!");
});
server.use((err,req,res,next)=>{
  return res.status(err.status || 500 ).json(err.message || "Error sorpresa")
})

server.use("*", (req,res,next)=>{
  const error =new Error("Route not found")
  error.status = 404
  next(error)
})


server.listen(PORT, () => {
  console.log("El server pita en http://localhost:" + PORT);
});

