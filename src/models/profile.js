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
    phoneNumber: {
      type: Number,
      required: false,
    },
    showPhoneNumber: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    hobbies: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export { Profile };
