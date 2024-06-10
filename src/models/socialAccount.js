import mongoose from "mongoose";
const { Schema } = mongoose;

const socialAccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },
    profileId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SocialAccountSchema = mongoose.model(
  "SocialAccountSchema",
  socialAccountSchema
);

export { SocialAccountSchema };
