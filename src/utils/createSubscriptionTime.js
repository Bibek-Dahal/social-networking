import moment from "moment";
import { SubscriptionPeriod } from "../constants.js";

export const createSubscriptionTime = (period) => {
  let newDateTime;
  switch (period) {
    case SubscriptionPeriod.Minutes:
      console.log("inside monthly");
      newDateTime = moment().add({ minutes: 3 }).utc();
      break;
    case SubscriptionPeriod.Monthly:
      console.log("inside monthly");
      newDateTime = moment().add({ months: 1 }).utc();
      break;
    case SubscriptionPeriod.Quarterly:
      newDateTime = moment().add({ months: 3 }).utc();
      break;
    case SubscriptionPeriod.SemiAnnually:
      newDateTime = moment().add(6, "months").utc();
      break;
    case SubscriptionPeriod.Annually:
      console.log("inside annually");
      newDateTime = moment().add({ year: 1 }).utc();
      break;
    default:
      throw new Error("Provided value doesnot match case");
  }

  return newDateTime;
};
