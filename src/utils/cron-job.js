import cron from 'node-cron';
import { Subscription } from '../models/subscription.js';
import moment from 'moment';

const updateUserActiveStatus = async () => {
  const currentTime = moment().utc().format();
  console.log('current-time==', currentTime);
  const result = await Subscription.find({
    expiryTime: {
      $lt: currentTime,
    },
  });
  return result;
};

export const scheduleCron = (time) => {
  //'*/10 * * * * *' every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    try {
      console.log('running every minute');
      const data = await updateUserActiveStatus();
      console.log('userData==', data);
    } catch (error) {
      console.log('something went wrong', error);
    }
  });
};
