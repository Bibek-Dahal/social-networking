import { SubscriptionPeriod } from "../constants.js";
export const determineUpOrDownSubs = (currentPeriod, newPeriod) => {
  const values = [];
  for (const key in SubscriptionPeriod) {
    console.log("key=", key);
    values.push(key);
  }
  console.log(values);

  if (values.indexOf(newPeriod) > values.indexOf(currentPeriod)) {
    return "Upgrade";
  } else {
    return "Downgrade";
  }
};
