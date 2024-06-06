import mongoose from "mongoose";

const { Schema } = mongoose;

const followRequest = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const FollowRequest = mongoose.model("FollowRequest", followRequest);
export { FollowRequest };
