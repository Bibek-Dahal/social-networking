import mongoose from "mongoose";
import { verificationEmailLifeTime } from "../constants.js";
const { Schema } = mongoose;

const emailTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
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

emailTokenSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds:
      Math.floor(Date.now() / 1000) + verificationEmailLifeTime,
  }
);

const EmailToken = mongoose.model("EmailToken", emailTokenSchema);
export { EmailToken };
