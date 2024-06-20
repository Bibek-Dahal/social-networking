import cron from 'node-cron';
import { Subscription } from '../models/subscription.js';
import { Event } from '../models/events.js';
import moment from 'moment';
import schedule from 'node-schedule';
const updateUserActiveStatus = async () => {
  const currentTime = moment.utc().format();
  console.log('current-time==', currentTime);
  const result = await Subscription.find({
    expiryTime: {
      $lt: currentTime,
    },
  });
  return result;
};

export const sendPriorNotification = async (schedulingDate) => {
  const date = new Date(
    schedulingDate.year(),
    schedulingDate.month(),
    schedulingDate.date(),
    schedulingDate.hours(),
    schedulingDate.minutes(),
    schedulingDate.seconds()
  );

  console.log('date===', date);
  const job = schedule.scheduleJob(date, function () {
    console.log('The world is going to end today.');
  });
  console.log('job-schedule-called');
};

export const scheduleCron = (time) => {
  //'*/10 * * * * *' every 10 seconds
  cron.schedule(
    '*/10 * * * * *',
    async () => {
      try {
        console.log('running every 10 seconds');
        const data = await updateUserActiveStatus();
        console.log('userData==', data);
      } catch (error) {
        console.log('something went wrong', error);
      }
    },
    {
      timezone: 'UTC',
    }
  );
};
