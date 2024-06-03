import mongoose from "mongoose";
const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    hobbies: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export { Profile };
