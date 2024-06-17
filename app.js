import express from 'express';
import { connectDb } from './src/config/connect_db.js';
import bodyParser from 'body-parser';
import auth from './src/routes/auth.js';
import user from './src/routes/user.js';
import profile from './src/routes/profile.js';
import post from './src/routes/post.js';
import comment from './src/routes/comment.js';
import home from './src/routes/home.js';
import like from './src/routes/like.js';
import adminUser from './src/routes/admin/user.js';
import adminPost from './src/routes/admin/post.js';
import subscription from './src/routes/admin/subscription.js';
import './src/passport/stratigies/jwt_strategy.js';
import './src/passport/stratigies/google_strategy.js';
import { seedUsers } from './src/seeders/user.js';
import { seedPost } from './src/seeders/post.js';
import { scheduleCron } from './src/utils/cron-job.js';

// import { generateSecretKey } from "./src/utils/generateSecretKey.js";
export const baseDir = process.cwd();
const app = express();
const PORT = process.env.PORT || 8000;
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

app.use('/api/admin/users', adminUser);
app.use('/api/admin/posts', adminPost);
app.use('/api/admin/subscriptions', subscription);

app.get('/', async (req, res) => {
  res.send('Hello World');
});

connectDb().then(() => {
  // seedPost();
  // seedUsers();.then(() => {
  // scheduleCron();
});

app.listen(PORT, () => {
  console.log(`App listening on PORT:${PORT}`);
});

import { generateQRCodeURL } from './src/utils/generateQrCode.js';

// console.log(generateSecretKey());
// generateQRCodeURL()
//   .then((dataURL) => {
//     console.log("Scan the QR code with the Google Authenticator app:");
//     console.log(dataURL);
//   })
//   .catch((err) => {
//     console.error("Error generating QR code:", err);
//   });
