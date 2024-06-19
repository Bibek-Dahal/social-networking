import mongoose from 'mongoose';

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    room: {
      type: String,
      unique: true,
      trim: true,
    },
    participents: {
      type: [Schema.Types.ObjectId, Schema.Types.ObjectId],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
export { Room };
