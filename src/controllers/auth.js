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
import { OTPmodel } from '../models/otpModel.js';
import { OtpType } from '../constants.js';
import { generateOTP } from '../utils/generateOtp.js';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';

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
        return res
          .status(400)
          .send(new ErrorApiResponse('User with username already exists'));
      }

      if (userWithEmail) {
        return res
          .status(400)
          .send(new ErrorApiResponse('User with email address already exists'));
      }
      if (req.file) {
        req.body.avatar = req.file.filename;
      }
      const user = await User.create(req.body);
      const { token: emailToken } = await generateToken(
        user,
        verificationEmailLifeTime
      );
      const otp = generateOTP();

      sendMail({
        user,
        subject: 'User Verification Email',
        token: otp,
      });
      console.log('user===', user);
      OTPmodel.create({
        user: user.id,
        isUsed: false,
        otp: otp,
        otpType: OtpType.Register,
      });

      return res.status(201).send(
        new SuccessApiResponse({
          message: 'User registration successfull',
          data: {
            userId: user.id,
          },
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static resendOtp = async (req, res) => {
    const { userId, otpType } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }

      const otp = generateOTP();
      sendMail({
        user,
        subject: 'Password Reset Email',
        token: otp,
      });

      OTPmodel.create({
        user: user.id,
        isUsed: false,
        otp: otp,
        otpType: otpType,
      });

      return res.status(201).send(
        new SuccessApiResponse({
          message: 'Otp send successfully',
          data: {
            userId: user.id,
          },
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static vefifyOtp = async (req, res) => {
    const { userId, otp, otpType } = req.body;
    try {
      const otpModel = await OTPmodel.findOne({
        user: userId,
        otp: otp,
        otpType: otpType,
      });
      console.log('otpModel==', otpModel);
      const user = await User.findById(userId);
      if (
        otpType == (otpType.Register || otpType.ResendRegisterOtp) &&
        user &&
        user.isEmailVerified
      ) {
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Email already verified',
          })
        );
      }

      if (!user) {
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }

      if (otpModel && otpModel.isUsed == false) {
        if (
          otpType == OtpType.Register ||
          otpType == OtpType.ResendRegisterOtp
        ) {
          user.isEmailVerified = true;
          user.save();
        }
        otpModel.isUsed = true;
        otpModel.save();
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Otp verification successfull',
            data: { otpId: otpModel.id },
          })
        );
      } else {
        return res
          .status(400)
          .send(new ErrorApiResponse('Otp couldnot be verified'));
      }
    } catch (error) {
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static login = async (req, res) => {
    console.log('login route called');
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(400)
          .send(
            new ErrorApiResponse(
              'The provided credential do not match our record'
            )
          );
      }
      console.log('outside email not verifed');
      if (!user.isEmailVerified) {
        console.log('inside email not verifed');
        const { token: emailToken } = await generateToken(
          user,
          verificationEmailLifeTime
        );
        const otp = generateOTP();

        console.log('user===', user);
        OTPmodel.create({
          user: user.id,
          isUsed: false,
          otp: otp,
          otpType: OtpType.ResendRegisterOtp,
        });
        sendMail({
          user,
          subject: 'User Verification Email',
          token: otp,
        });
        return res.status(400).send({
          code: 'not-verified',
          userId: user.id,
          message:
            'E-mail not verified. We have sent you verification email. Please verify your email address.',
          success: false,
        });
      }

      if (user.blockUser) {
        return res
          .status(400)
          .send(
            new ErrorApiResponse(
              'We are sorry to notify you that you are restricted to access this site. Please contact support for further information.'
            )
          );
      }

      const result = await User.comparePassword(password, user.password);
      if (!result) {
        return res
          .status(400)
          .send(
            new ErrorApiResponse(
              'The provided credential do not match our record'
            )
          );
      }

      if (user.mfaEnabled) {
        const encryptedUserId = encryptData({
          data: user.id,
          secretKey: process.env.AES_SECRET_KEY,
        });
        console.log('encrypted-data', encryptedUserId);
        return res.status(209).send(
          new SuccessApiResponse({
            message: '',
            data: `${encryptedUserId}`,
          })
        );
        // return res.redirect(
        //   `http://localhost:8000/verify-otp?id=${encryptedUserId}`
        // );
      }

      const tokens = await user.generateJwtTokens();
      await Jwt.create({
        user: user._id,
        uuid: tokens.uuid,
      });

      const newUser = user.toObject();
      delete newUser.password;
      console.log('newUser===', newUser);
      res.status(200).send(
        new SuccessApiResponse({
          data: {
            ...tokens,
            user: newUser,
          },
          message: 'User login successfull.',
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static generateNewAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    try {
      //check if token is vlid
      const jwtToken = await verifyJwtToken(refreshToken);

      console.log('jwt-token==', jwtToken);

      if (!jwtToken) {
        return res.status(400).send(new ErrorApiResponse('Token expired'));
      }
      const token = await Jwt.findOne({ uuid: jwtToken.data.uuid });
      if (!token) {
        return res
          .status(404)
          .send(
            new ErrorApiResponse(
              'Cant login with given token. Either token is expired or doesnot exists'
            )
          );
      }

      const newAccessToken = await generateAccessToken({
        id: jwtToken.data.id,
        userName: jwtToken.data.userName,
        email: jwtToken.data.email,
      });
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Access token generated successfully',
          data: {
            accessToken: newAccessToken,
          },
        })
      );
    } catch (error) {
      console.log('error', error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const jwtToken = await verifyJwtToken(refreshToken);

      if (!jwtToken) {
        return res.status(400).send(new ErrorApiResponse('Token expired'));
      }

      const token = await Jwt.findOneAndDelete({ uuid: jwtToken.data.uuid });

      // token.isBlackListed = true;
      // await token.save();
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'User log out successfull',
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static logoutFromAllDevice = async (req, res) => {
    try {
      await Jwt.deleteMany({
        user: req.user.id,
      });

      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Logged out from all devices',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
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
        return res
          .status(400)
          .send(
            new ErrorApiResponse(
              'Provided password do not match current password'
            )
          );
      }

      currentUser.password = newPassword1;
      await currentUser.save();
      //logout current authenticated user from all device
      if (logoutFromAllDevice) {
        await Jwt.deleteMany({
          user: req.user.id,
        });
      }

      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Password change successfull',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
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
      return res.status(400).send(
        new ErrorApiResponse({
          message: 'Invalid token',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static passwordReset = async (req, res) => {
    console.log('pwd reset email sent');
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

      const otp = generateOTP();

      await EmailToken.create({
        user: user.id,
        uuid: uuid,
      });

      const otpObj = await OTPmodel.create({
        user: user.id,
        isUsed: false,
        otp: otp,
        otpType: OtpType.PasswordResetOtp,
      });

      sendMail({
        user,
        subject: 'Password Reset Email',
        token: otp,
      });
      return res.status(200).send(
        new SuccessApiResponse({
          data: {
            userId: user.id,
            token: token,
            oid: otpObj.id,
          },
          message: 'Password reset email sent',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static passwordResetConfirm = async (req, res) => {
    const { token, oId, newPassword1, newPassword2 } = req.body;
    let decodedToken;
    console.log('Oid===', oId);

    try {
      try {
        decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decodedToken);
      } catch (error) {
        return res.status(400).send(new ErrorApiResponse('Token Expired'));
      }
      const user = await User.findById(decodedToken.data.id);
      const otpObj = await OTPmodel.findById(oId);
      const emailToken = await EmailToken.findOne({
        uuid: decodedToken.data.uuid,
      });
      if (!user) {
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }

      if (!otpObj || !emailToken) {
        return res
          .status(400)
          .send(new ErrorApiResponse('Password reset link expired'));
      }

      if (!otpObj.isUsed) {
        return res.status(400).send(new ErrorApiResponse('Otp not verified'));
      }

      if (
        otpObj.user == user.id &&
        emailToken.user == user.id &&
        otpObj.otpType ==
          (OtpType.PasswordResetOtp || OtpType.ResendPasswordResetOtp)
      ) {
        user.password = newPassword1;
        await user.save();
        await EmailToken.findOneAndDelete({ uuid: decodedToken.data.uuid });

        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Password reset successfull',
          })
        );
      } else {
        return res
          .status(400)
          .send(new ErrorApiResponse('Cant reset password'));
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
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
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }

      const result = verifyOTP(user.googleAuthSecret, otp);

      if (result) {
        //send jwt
        const tokens = await user.generateJwtTokens();
        await Jwt.create({
          user: user._id,
          uuid: tokens.uuid,
        });

        return res.status(200).send(
          new SuccessApiResponse({
            data: {
              ...tokens,
              id: user._id,
              userName: user.userName,
              email: user.email,
            },
            message: 'User login successfull.',
          })
        );
      }
      return res.status(400).send(new ErrorApiResponse('Otp not verified'));
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };
}
