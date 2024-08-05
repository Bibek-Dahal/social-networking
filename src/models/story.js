import mongoose from 'mongoose';
import { storyType } from '../constants.js';
const { Schema } = mongoose;

const storySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    reply: [
      {
        content: {
          type: String,
          required: true,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    contentType: {
      type: String,
      required: true,
      enum: [storyType.Image, storyType.Note],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

storySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Math.floor(Date.now() / 1000) + 24 * 60 * 60 }
);

const Story = mongoose.model('Story', storySchema);

export { Story };
