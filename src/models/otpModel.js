import mongoose from 'mongoose';
const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
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
