import {nanoid} from "nanoid";
import Room from "../api/room/room.model.js";

async function generateUniqueCode() {
  let unique = false;
  let code = "";
 
      while (!unique) {
        code = nanoid(4);
        const existingRoom = await Room.findOne({ room_code: code });
        if (!existingRoom) unique = true;
      }
    
  return code;
}

export default generateUniqueCode;