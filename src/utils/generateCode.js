import { nanoid } from "nanoid";
import Room from "../api/room/room.model.js";

async function generateUniqueCode(maxAttempts = 10) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const code = nanoid(4);
    const existingRoom = await Room.findOne({ game_code: code });

    if (!existingRoom) {
      return code; // Retorna el código si es único
    }

    attempts++;
  }

  throw new Error("No se pudo generar un código único después de varios intentos.");
}

export default generateUniqueCode;
