import express from 'express';
import { connectDb } from './src/config/connect_db.js';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from './src/models/user.js';
import bodyParser from 'body-parser';
import { io } from './src/websocket/websocket.js';

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
  story,
} from './src/routes/index.js';
import './src/passport/stratigies/jwt_strategy.js';
import './src/passport/stratigies/google_strategy.js';
import { seedUsers } from './src/seeders/user.js';
import { seedPost } from './src/seeders/post.js';
import { scheduleCron } from './src/utils/cron-job.js';
import ngrok from '@ngrok/ngrok';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import { resolvers } from './src/graphql/resolvers.js';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import cors from 'cors';
import customAuthMiddleware from './src/middlewares/custom_auth_middleware.js';
import { firebaseInit } from './src/config/firebase-config.js';
import path from 'path';
const corsOptions = {
  origin: '*',
  // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// import { generateSecretKey } from "./src/utils/generateSecretKey.js";
export const baseDir = process.cwd();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors(corsOptions));
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(process.cwd(), 'src', 'views'));
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
app.use('/api/story', story);
app.use('/api/static', express.static('./src/public'));

app.use('/api/admin/users', adminUser);
app.use('/api/admin/posts', adminPost);
app.use('/api/admin/subscriptions', subscription);

app.get('/', async (req, res) => {
  return res.render('home.ejs');
  res.status(200).send({ data: 'Hello World' });
});

connectDb().then(() => {
  // seedPost();
  // seedUsers();.then(() => {
  // scheduleCron();
});

const typeDefs = gql(
  readFileSync('./src/graphql/schema.graphql', {
    encoding: 'utf-8',
  })
);
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // formatError: (formattedError, error) => {
  //   // Return a different error message
  //   // if (formattedError.extensions.code === ApolloServerErrorCode.BAD_REQUEST) {
  //   // console.log('formatted error===', formattedError);
  //   return {
  //     code: formattedError.extensions.code,
  //     message: formattedError.message,
  //   };
  //   // }

  //   // Otherwise return the formatted error. This error can also
  //   // be manipulated in other ways, as long as it's returned.
  //   return formattedError;
  // },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      // console.log('hello', req.path);
      // console.log('req.body', req.body.operationName);
      // if (
      //   req.body.operationName === 'Register' ||
      //   req.body.operationName === 'Login' ||
      //   req.body.operationName === 'RefreshToken'
      // ) {
      //   return {};
      // }
      // const user = await AuthService.getUserFromToken(
      //   req.headers.authorization
      // );
      // console.log(user);
      const token = req.headers.authorization;
      return { token };
    },
  })
);
await new Promise((resolve) => httpServer.listen({ port: 8000 }, resolve));
console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`);

io.listen(httpServer);

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
import { authMiddleware } from './src/middlewares/auth.js';
import { UserRepository } from './src/graphql/repository/userRepository.js';
import { AuthService } from './src/graphql/services/authServices.js';

export const bucket = await firebaseInit();

console.log(moment().utc());
console.log(moment.utc().local());

// import './src/utils/eventHandler.js';
