import mongoose from "mongoose";
import { refreshTokenLifeTime } from "../constants";
const { Schema } = mongoose;

const jwtSchema = new Schema(
  {
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
    expireAt: {
      type: Date,
      expires: refreshTokenLifeTime,
    },
  },
  {
    timestamps: true,
  }
);

const Jwt = mongoose.model("Jwt", jwtSchema);
export { Jwt };
