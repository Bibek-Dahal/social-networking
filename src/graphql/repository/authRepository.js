import { UserRepository } from './userRepository.js';
import { GraphQLError } from 'graphql';
import { User } from '../../models/user.js';
import { Jwt } from '../../models/jwtTokens.js';
import { verifyJwtToken } from '../../utils/jwt_token.js';
import { generateAccessToken } from '../../utils/jwt_token.js';
import { JwtRepository } from './JwtRepository.js';
export class AuthRepository {
  static register = async (registerInput) => {
    const { userName, email, password, repeatPassword } = registerInput;

    console.log('email===', password, repeatPassword);
    const userWithEmail = await UserRepository.findUserByEmail(email);
    const userWithUserName = await UserRepository.findUserByUsername(userName);
    if (userWithEmail) {
      throw new GraphQLError('User with email already exiss', {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 400 },
        },
      });
    }

    if (userWithUserName) {
      throw new GraphQLError('User with username already exiss', {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 400 },
        },
      });
    }

    if (password != repeatPassword) {
      throw new GraphQLError('Password fields do not match', {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 400 },
        },
      });
    }

    const user = await UserRepository.createUser({
      userName,
      email,
      password,
      isEmailVerified: true,
    });
    return user;
  };

  static login = async (loginInput) => {
    const { email, password } = loginInput;
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new GraphQLError('Provided credentais do not match our records', {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 400 },
        },
      });
    }

    const passwordMatched = await User.comparePassword(password, user.password);

    if (!passwordMatched) {
      throw new GraphQLError('Provided credentais do not match our records', {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 400 },
        },
      });
    }

    const tokens = await user.generateJwtTokens();
    await Jwt.create({
      user: user._id,
      uuid: tokens.uuid,
    });

    return {
      data: user,
      ...tokens,
    };
  };

  static refreshToken = async (refreshToken) => {
    const jwtToken = await verifyJwtToken(refreshToken);

    console.log('jwt-token==', jwtToken);

    if (!jwtToken) {
      throw new GraphQLError('Token Expired', {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 401 },
        },
      });
    }
    const token = await JwtRepository.findJwtById(jwtToken.data.uuid);
    console.log('jwt-Token-model===', token);

    if (!token) {
      throw new GraphQLError(
        'Cant login with given token. Either token is expired or doesnot exists',
        {
          extensions: {
            code: 'BAD_REQUEST',
            http: { status: 400 },
          },
        }
      );
    }

    const newAccessToken = await generateAccessToken({
      id: jwtToken.data.id,
      userName: jwtToken.data.userName,
      email: jwtToken.data.email,
    });
    return newAccessToken;
  };
}
