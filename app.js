import express from 'express';
import { connectDb } from './src/config/connect_db.js';
import bodyParser from 'body-parser';
import {
  auth,
  user,
  post,
  profile,
  comment,
  event,
  adminPost,
  like,
  chat,
  subscription,
  home,
  adminUser,
  test,
} from './src/routes/index.js';
import './src/passport/stratigies/jwt_strategy.js';
import './src/passport/stratigies/google_strategy.js';
import { seedUsers } from './src/seeders/user.js';
import { seedPost } from './src/seeders/post.js';
import { scheduleCron } from './src/utils/cron-job.js';
import ngrok from '@ngrok/ngrok';

import cors from 'cors';
const corsOptions = {
  origin: '*',
  // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// import { generateSecretKey } from "./src/utils/generateSecretKey.js";
export const baseDir = process.cwd();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors(corsOptions));
//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/account', auth);
app.use('/api/user', user);
app.use('/api/profile', profile);
app.use('/api/post', post);
app.use('/api/comment', comment);
app.use('/api/home', home);
app.use('/api/like', like);
app.use('/api/event', event);
app.use('/api/chat', chat);
app.use('/api/test', test);

app.use('/api/admin/users', adminUser);
app.use('/api/admin/posts', adminPost);
app.use('/api/admin/subscriptions', subscription);

app.get('/', async (req, res) => {
  res.status(200).send({ data: 'Hello World' });
});

connectDb().then(() => {
  // seedPost();
  // seedUsers();.then(() => {
  // scheduleCron();
});

app.listen(PORT, () => {
  console.log(`App listening on PORT:${PORT}`);
});

// (async function () {
//   // Establish connectivity
//   const listener = await ngrok.forward({
//     addr: 8000,
//     // authtoken_from_env: true,
//     authtoken: '2id1K5Hu2mDvaxlR5Ml5C274hba_6jxn94pbkggKsvGg51Dcp',
//   });

//   // Output ngrok url to console
//   console.log(`Ingress established at: ${listener.url()}`);
// })();

import { generateQRCodeURL } from './src/utils/generateQrCode.js';

// console.log(generateSecretKey());
// generateQRCodeURL()
//   .then((dataURL) => {
//     console.log('Scan the QR code with the Google Authenticator app:');
//     console.log(dataURL);
//   })
//   .catch((err) => {
//     console.error('Error generating QR code:', err);
//   });

// function getTimezoneName() {
//   const options = { timeZoneName: 'long' };
//   const timezone = Intl.DateTimeFormat(undefined, options).resolvedOptions()
//     .timeZone;
//   return timezone;
// }

// // Example usage:
// const timezoneName = getTimezoneName();
// console.log(timezoneName);

import moment from 'moment';
console.log(moment().utc());
console.log(moment.utc().local());

// import './src/utils/eventHandler.js';
