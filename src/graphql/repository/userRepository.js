import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from '../../models/user.js';
import 'dotenv/config';
import { Post } from '../../models/post.js';

export class UserRepository {
  static findUserById = async (userId) => {
    const user = await User.findById(userId);
    return user;
  };

  static findUserByEmail = async (email) => {
    const user = await User.findOne({ email: email });
    return user;
  };

  static findUserByUsername = async (userName) => {
    const user = await User.findOne({ userName: userName });
    return user;
  };

  static createUser = async (userInput) => {
    const user = await User.create(userInput);
    console.log('user====', user);
    return user;
  };
}
