import { User } from '../models/user.js';
import { Jwt } from '../models/jwtTokens.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { verifyJwtToken, generateAccessToken } from '../utils/jwt_token.js';
import { v4 as uuidv4 } from 'uuid';
import { sendMail } from '../utils/send_mail.js';
import { generateToken } from '../utils/jwt_token.js';
import { serverError, verificationEmailLifeTime } from '../constants.js';
import { EmailToken } from '../models/userEmailToken.js';
import { verifyOTP } from '../utils/verifyOtp.js';
import { decryptData, encryptData } from '../utils/encryptDecrypt.js';
import 'dotenv/config';

export class AuthController {
  static register = async (req, res) => {
    try {
      const userWithUserName = await User.findOne({
        userName: req.body.userName,
      });
      const userWithEmail = await User.findOne({
        email: req.body.email,
      });
      if (userWithUserName) {
        let errors = {};
        errors.email = 'User with username already exists';
        return res.status(400).send({ errors });
      }

      if (userWithEmail) {
        let errors = {};
        errors.email = 'User with email address already exists';
        return res.status(400).send({ errors });
      }
      const user = await User.create(req.body);
      const { token: emailToken } = await generateToken(
        user,
        verificationEmailLifeTime
      );

      sendMail({
        user,
        subject: 'User Verification Email',
        token: emailToken,
      });
      console.log('user===', user);

      return res.status(201).send({
        message: 'User registration successfull',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        errors: {
          message: 'Something went wrong',
          success: false,
        },
      });
    }
  };

  static login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).send({
          message: 'The provided credential do not match our record',
          success: false,
        });
      }
      if (!user.isEmailVerified) {
        const { token: emailToken } = await generateToken(
          user,
          verificationEmailLifeTime
        );
        sendMail({
          user,
          subject: 'User Verification Email',
          token: emailToken,
        });
        return res.status(400).send({
          message:
            'E-mail not verified. We have sent you verification email. Please verify your email address.',
          success: false,
        });
      }

      if (user.blockUser) {
        return res.status(400).send({
          message:
            'We are sorry to notify you that you are restricted to access this site. Please contact support for further information.',
          success: false,
        });
      }

      const result = await User.comparePassword(password, user.password);
      if (!result) {
        return res.status(400).send({
          message: 'The provided credential do not match our record',
          success: false,
        });
      }
      console.log('secret-key', process.env.AES_SECRET_KEY);
      if (user.mfaEnabled) {
        const encryptedUserId = encryptData({
          data: user.id,
          secretKey: process.env.AES_SECRET_KEY,
        });
        console.log('encrypted-data', encryptedUserId);
        return res.redirect(
          `http://localhost:8000/verify-otp?id=${encryptedUserId}`
        );
      }

      const tokens = await user.generateJwtTokens();
      await Jwt.create({
        user: user._id,
        uuid: tokens.uuid,
      });

      res.status(200).send({
        ...tokens,
        data: {
          id: user._id,
          userName: user.userName,
          email: user.email,
        },
        message: 'User login successfull.',
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        errors: {
          message: 'Something went wrong',
          success: false,
        },
      });
    }
  };

  static generateNewAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    try {
      //check if token is vlid
      const jwtToken = await verifyJwtToken(refreshToken);

      console.log('jwt-token==', jwtToken);

      if (!jwtToken) {
        return res.status(400).send({
          message: 'Token expired',
          success: false,
        });
      }
      const token = await Jwt.findOne({ uuid: jwtToken.data.uuid });
      if (!token) {
        return res.status(404).send({
          message:
            'Cant login with given token. Either token is expired or doesnot exists',
          success: false,
        });
      }

      const newAccessToken = await generateAccessToken({
        id: jwtToken.data.id,
        userName: jwtToken.data.userName,
        email: jwtToken.data.email,
      });
      return res.status(200).send({
        message: 'Access token generated successfully',
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.log('error', error);
      res.status(500).send({
        message: 'something went wrong',
        success: false,
      });
    }
  };

  static logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const jwtToken = await verifyJwtToken(refreshToken);

      if (!jwtToken) {
        return res.status(400).send({
          message: 'Token expired',
          success: false,
        });
      }

      const token = await Jwt.findOneAndDelete({ uuid: jwtToken.data.uuid });

      // token.isBlackListed = true;
      // await token.save();
      return res.status(200).send({
        message: 'User log out successfull',
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static logoutFromAllDevice = async (req, res) => {
    try {
      await Jwt.deleteMany({
        user: req.user.id,
      });

      return res.status(200).send({
        message: 'Logged out from all devices',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static passwordChange = async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword1,
        newPassword2,
        logoutFromAllDevice,
      } = req.body;
      // console.log("user-id==", req.user);
      const currentUser = await User.findById(req.user.id);
      const passwordMatch = await User.comparePassword(
        currentPassword,
        currentUser.password
      );
      console.log('passwordMatch===', passwordMatch);
      if (!passwordMatch) {
        return res.status(400).send({
          success: false,
          message: 'Provided password do not match current password',
        });
      }

      currentUser.password = newPassword1;
      await currentUser.save();
      //logout current authenticated user from all device
      if (logoutFromAllDevice) {
        await Jwt.deleteMany({
          user: req.user.id,
        });
      }

      return res.status(200).send({
        success: true,
        message: 'Password change successfull',
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static verifyEmail = async (req, res) => {
    try {
      const token = await verifyJwtToken(req.body.token);
      if (token) {
        console.log(token);
        const user = await User.findById(token.data.id);
        user.isEmailVerified = true;
        await user.save();

        return res.redirect('/');

        // status(200).send({
        //   message: "Email verification successfull",
        //   success: true,
        // });
      }
      return res.status(400).send({
        message: 'Invalid token',
        success: false,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static passwordReset = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(200).send({
          message: 'Password reset email send',
          success: true,
        });
      }
      const { token, uuid } = await generateToken(
        user,
        verificationEmailLifeTime
      );

      await EmailToken.create({
        user: user.id,
        uuid: uuid,
      });

      await sendMail({
        user,
        subject: 'Password Reset Email',
        token: token,
      });
      return res.status(200).send({
        message: 'Password reset email sent',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static passwordResetConfirm = async (req, res) => {
    const { token } = req.params;
    const { newPassword1, newPassword2 } = req.body;
    try {
      const userSubmittedToken = await verifyJwtToken(token);
      if (!userSubmittedToken) {
        return res.status(400).send({
          success: false,
          message: 'Token expired.',
        });
      }

      const emailToken = await EmailToken.findOne({
        user: userSubmittedToken.data.id,
        uuid: userSubmittedToken.data.uuid,
      });

      console.log('email-token==', emailToken);
      if (!emailToken) {
        return res.status(400).send({
          success: false,
          message:
            'Email token has been already used or user with userId does not exists',
        });
      }

      const user = await User.findById(userSubmittedToken.data.id);
      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'User not found',
        });
      }

      user.password = newPassword1;
      await user.save();
      const deletedToken = await EmailToken.deleteOne({ _id: emailToken._id });
      console.log('deleted-token', deletedToken);
      return res.redirect('/');
      // return res.status(200).send({
      //   success:true,
      //   message:"Password reset successfull"
      // })
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static verifyUserOtp = async (req, res) => {
    const { id, otp } = req.body;
    console.log('verify-Otp-called man');
    try {
      //decode user id first
      const secret = process.env.AES_SECRET_KEY;

      const decryptedUserId = decryptData({
        encryptedData: id,
        secretKey: secret,
      });
      console.log('decrypted-data===', decryptedUserId);
      const user = await User.findById(decryptedUserId);
      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'User not found',
        });
      }

      const result = verifyOTP(user.googleAuthSecret, otp);

      if (result) {
        //send jwt
        const tokens = await user.generateJwtTokens();
        await Jwt.create({
          user: user._id,
          uuid: tokens.uuid,
        });

        return res.status(200).send({
          ...tokens,
          data: {
            id: user._id,
            userName: user.userName,
            email: user.email,
          },
          message: 'User login successfull.',
          success: true,
        });
      }
      return res.status(400).send({
        success: false,
        message: 'Otp not verified',
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };
}
