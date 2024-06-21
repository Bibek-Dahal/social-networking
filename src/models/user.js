import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { saltRound } from '../constants.js';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { accessTokenLifeTime, refreshTokenLifeTime } from '../constants.js';
import { Profile } from './profile.js';
import { userRoles } from '../constants.js';
import { Post } from './post.js';

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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: 'String',
      enum: [userRoles.Admin, userRoles.User],
      default: userRoles.User,
    },
    blockUser: {
      type: Boolean,
      default: false,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    googleAuthSecret: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    userPostCount: {
      type: Number,
      default: 0,
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
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
          exp: Math.floor(Date.now() / 1000) + accessTokenLifeTime,
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
          exp: Math.floor(Date.now() / 1000) + refreshTokenLifeTime,
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
      reject({ message: 'Jwt token cant be created.' });
    }
  });

  return jwtPromise;
};

userSchema.pre('save', function (next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // hash the password using our new salt
  bcrypt.hash(user.password, saltRound, function (err, hash) {
    if (err) return next(err);

    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });
});

userSchema.post('save', async function (doc, next) {
  console.log('user post save called ');
  const user = doc;
  try {
    const profile = await Profile.findOne({ user: user._id });
    if (profile) {
      console.log('profile==', profile);
      next();
    } else {
      Profile.create({
        user: user._id,
        phoneNumber: null,
        avatar: null,
      });
    }
  } catch (error) {
    next(error);
  }
});

userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'user',
  count: true,
});
const User = mongoose.model('User', userSchema);
export { User };
