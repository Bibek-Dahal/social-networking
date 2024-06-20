import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { accessTokenLifeTime } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';
export const verifyJwtToken = function (token) {
  const promise = new Promise((resolve, reject) => {
    try {
      const jwtToken = jwt.verify(token, process.env.JWT_SECRET);
      if (jwtToken) {
        resolve(jwtToken);
      } else {
        reject(null);
      }
    } catch (error) {
      reject(error);
    }
  });

  return promise;
};

export const generateAccessToken = (user) => {
  const promise = new Promise((resolve, reject) => {
    try {
      const accessToken = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + accessTokenLifeTime,
          data: {
            id: user.id,
            userName: user.userName,
            email: user.email,
          },
        },
        process.env.JWT_SECRET
      );

      resolve(accessToken);
    } catch (error) {
      reject(error);
    }
  });

  return promise;
};

export const generateToken = (user, tokenLifetime) => {
  const promise = new Promise((resolve, reject) => {
    try {
      const uuid = uuidv4();
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + tokenLifetime,
          data: {
            id: user.id,
            userName: user.userName,
            email: user.email,
            uuid: uuid,
          },
        },
        process.env.JWT_SECRET
      );

      resolve({ token, uuid });
    } catch (error) {
      reject(error);
    }
  });

  return promise;
};
