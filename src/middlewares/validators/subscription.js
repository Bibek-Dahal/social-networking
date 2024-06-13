import Joi from "joi";
import showValidationsError from "../../utils/display_validation_error.js";
import { SubscriptionPeriod } from "../../constants.js";

export class SubscriptionValidator {
  static async createSubscription(req, res, next) {
    const schema = Joi.object({
      renewalPeriod: Joi.any()
        .valid(
          SubscriptionPeriod.Minutes,
          SubscriptionPeriod.Monthly,
          SubscriptionPeriod.Quarterly,
          SubscriptionPeriod.SemiAnnually,
          SubscriptionPeriod.Annually
        )
        .required(),
    });

    await showValidationsError(req, res, next, schema);
  }

  static async upgradeOrDowngradeSubscription(req, res, next) {
    const schema = Joi.object({
      renewalPeriod: Joi.any()
        .valid(
          SubscriptionPeriod.Minutes,
          SubscriptionPeriod.Monthly,
          SubscriptionPeriod.Quarterly,
          SubscriptionPeriod.SemiAnnually,
          SubscriptionPeriod.Annually
        )
        .required(),
    });

    await showValidationsError(req, res, next, schema);
  }
}
