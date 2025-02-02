import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    linked_to: { type: String, required: true },
    player_code: { type: String, required: true }
  });
  
  const RuleSchema = new Schema({
    player_1: { type: String, required: true },
    player_2: { type: String, required: true }
  });
const RoomSchema = new Schema({
   
    name: { type: String, required: true },
    owner_id: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
 
    average_cost: { type: Number, required: true },
    status: { type: String, required: true, enum: ['active', 'finished'] },
    room_code: { type: String },
    players: [PlayerSchema],
    rules: [RuleSchema],
  },
  {
    timestamps: true,
    collection: 'room',
  });

  
  const Room = mongoose.model('room', RoomSchema);
  
export default Room;