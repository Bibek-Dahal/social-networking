import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { saltRound } from "../constants.js";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.statics.comparePassword = async function (plaintext, hashedText) {
  const match = await bcrypt.compare(plaintext, hashedText);
  return match;
};

userSchema.methods.generateJwtTokens = function () {
  const user = this;

  const jwtPromise = new Promise((resolve, reject) => {
    const uuid = uuidv4();
    try {
      const accessToken = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 40,
          data: {
            id: user._id,
            userName: user.userName,
            email: user.email,
          },
        },
        process.env.JWT_SECRET
      );
      const refreshToken = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,
          data: {
            uuid: uuid,
            id: this._id,
            userName: this.userName,
            email: this.email,
          },
        },
        process.env.JWT_SECRET
      );
      resolve({ accessToken, refreshToken, uuid });
    } catch (error) {
      reject({ message: "Jwt token cant be created." });
    }
  });

  return jwtPromise;
};

userSchema.pre("save", function (next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // hash the password using our new salt
  bcrypt.hash(user.password, saltRound, function (err, hash) {
    if (err) return next(err);

    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);
export { User };
