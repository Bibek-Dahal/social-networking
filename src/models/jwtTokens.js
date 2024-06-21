import mongoose from 'mongoose';

const { Schema } = mongoose;

const jwtSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  uuid: {
    type: Schema.Types.UUID,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

jwtSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60 }
);

const Jwt = mongoose.model('Jwt', jwtSchema);
export { Jwt };
