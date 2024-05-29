import mongoose from "mongoose";
import { refreshTokenLifeTime } from "../constants.js";
const { Schema } = mongoose;

const jwtSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  token: {
    type: String,
    required: true,
  },
  isBlackListed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 10,
  },
});

const Jwt = mongoose.model("Jwt", jwtSchema);
export { Jwt };
