import { Subscription } from "../../models/subscription.js";
import { serverError } from "../../constants.js";

export class SubscriptionController {
  static listAllSubscription = async (req, res) => {
    console.log("list subscripton called");
    try {
      const subscription = await Subscription.find({}).select(
        "subscribeFrom subscribeTo renewalPeriod isExpired expiryTime"
      );
      res.status(200).send({
        message: "All subscription listed",
        data: subscription,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };
}
