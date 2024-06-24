import mongoose from 'mongoose';
const { Schema } = mongoose;

const testSchema = new Schema(
  {
    firstName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    ratePerHour: {
      type: Number,

      trim: true,
      default: 0,
    },
    hours: {
      type: Number,
      trim: true,
      default: 0,
    },
    total: {
      type: Number,
      trim: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Test = mongoose.model('Test', testSchema);
export { Test };
