// npm install @apollo/server express graphql cors
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import gql from 'graphql-tag';
import { resolvers } from './src/graphql/resolvers.js';
import { connectDb } from './src/config/connect_db.js';
import { readFileSync } from 'fs';

const typeDefs = gql(
  readFileSync('./src/graphql/schema.graphql', {
    encoding: 'utf-8',
  })
);

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      console.log('Hello');
      return { token: req.headers.token };
    },
  })
);

connectDb().then(() => {
  // seedPost();
  // seedUsers();.then(() => {
  // scheduleCron();
});

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);
