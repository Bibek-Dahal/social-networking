import mongoose from 'mongoose';
import { EventStatus } from '../constants.js';

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    participents: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },

    status: {
      type: String,
      enum: [EventStatus.Active, EventStatus.Ongoing, EventStatus.Ended],
      default: EventStatus.Active,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      type: [Number, Number],
      required: true,
      default: [0, 0],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const Event = mongoose.model('Event', eventSchema);
export { Event };
