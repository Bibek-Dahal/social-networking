import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from '../models/user.js';
import 'dotenv/config';
import { Post } from '../models/post.js';

export class UserRepository {
  static getUserFromToken = async (token) => {
    // console.log('jwtSercret', process.env.JWT_SECRET);
    // console.log('token===', token.split(' ')[1]);
    try {
      if (!token || !token.startsWith('Bearer ')) {
        throw new GraphQLError('User is not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }

      // Verify JWT
      const decodedToken = await jwt.verify(
        token.split(' ')[1],
        process.env.JWT_SECRET
      );

      // Fetch user based on decoded token
      const user = await User.findById(decodedToken.data.id);

      // console.log('user===', user);

      // console.log('decodedtoken user id===', decodedToken.data.id);

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }

      // Attach authenticated user to context
      return user;
    } catch (error) {
      throw new GraphQLError('Authentication failed', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }
  };

  static listUserPost = async (context) => {
    const posts = await Post.find({ user: context.user.id }).populate('user');

    return posts;
  };
}
