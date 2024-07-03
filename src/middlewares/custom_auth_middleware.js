// authMiddleware.js

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from '../models/user.js';
import 'dotenv/config';

const customAuthMiddleware = async (req) => {
  try {
    console.log('Custom auth middleware called');

    // Check if Authorization header exists and has correct format
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      throw new GraphQLError('User is not authenticated', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }

    // Extract token from Authorization header
    const token = req.headers.authorization.split(' ')[1];

    // Verify JWT
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user based on decoded token
    const user = await User.findById(decodedToken.data.id);

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
    console.error('Authentication error:', error);

    // Handle different types of errors
    if (error.name === 'JsonWebTokenError') {
      throw new GraphQLError('Invalid token', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    } else if (error.name === 'TokenExpiredError') {
      throw new GraphQLError('Token expired', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    } else {
      // Generic error handling
      throw new GraphQLError('Authentication failed', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          http: { status: 500 },
        },
      });
    }
  }
};

export default customAuthMiddleware;
