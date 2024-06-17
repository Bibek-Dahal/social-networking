import mongoose from "mongoose";
import { SubscriptionPeriod } from "../constants.js";
import moment from "moment";

const { Schema } = mongoose;

const subscriptionSchema = new Schema(
  {
    subscribeFrom: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subscribeTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionRate: {
      type: Number,
      required: true,
    },
    expiryTime: {
      type: Date,
      required: true,
    },
    renewalPeriod: {
      type: String,
      enum: [
        SubscriptionPeriod.Minutes,
        SubscriptionPeriod.Monthly,
        SubscriptionPeriod.Quarterly,
        SubscriptionPeriod.SemiAnnually,
        SubscriptionPeriod.Annually,
      ],
      default: SubscriptionPeriod.Monthly,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
subscriptionSchema.virtual("isExpired").get(function () {
  // return false;
  return this.expiryTime.getTime() - moment().valueOf() < 0 ? true : false;
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export { Subscription };
