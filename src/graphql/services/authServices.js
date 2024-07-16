import { UserRepository } from '../repository/userRepository.js';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
export class AuthService {
  static getUserFromToken = async (token) => {
    // console.log('get user from login called--');
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
      const user = await UserRepository.findUserById(decodedToken.data.id);

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
      //   console.log(':error==', error);
      throw new GraphQLError('Authentication failed', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }
  };
  static getLoggedInUser = async (token) => {
    const user = await AuthService.getUserFromToken(token);

    return user;
  };
}
