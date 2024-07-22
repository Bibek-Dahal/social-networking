import mongoose from 'mongoose';
import { OtpType } from '../constants.js';
const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    otpType: {
      type: String,
      enum: [
        OtpType.Register,
        OtpType.PasswordResetOtp,
        OtpType.ResendRegisterOtp,
        OtpType.ResendPasswordResetOtp,
      ],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 1 * 60 * 1000), // Default expiry time (5 minutes from now)
      index: { expires: '1m' }, // Index to automatically delete documents after expiry
    },
  },
  {
    timestamps: true,
  }
);

const OTPmodel = mongoose.model('Otp', otpSchema);
export { OTPmodel };
