import { User } from "../models/user.js";
import { Jwt } from "../models/jwtTokens.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { verifyJwtToken, generateAccessToken } from "../utils/jwt_token.js";
import { v4 as uuidv4 } from "uuid";

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
        errors.email = "User with username already exists";
        return res.status(400).send({ errors });
      }

      if (userWithEmail) {
        let errors = {};
        errors.email = "User with email address already exists";
        return res.status(400).send({ errors });
      }
      await User.create(req.body);
      return res.status(201).send({
        message: "User registration successfull",
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        errors: {
          message: "Something went wrong",
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
          message: "The provided credential do not match our record",
          success: false,
        });
      }

      const result = await User.comparePassword(password, user.password);
      if (!result) {
        return res.status(400).send({
          message: "The provided credential do not match our record",
          success: false,
        });
      }

      const tokens = await user.generateJwtTokens();
      await Jwt.create({
        user: user._id,
        uuid: tokens.uuid,
      });

      console.log(tokens);
      // delete tokens.uuid;

      res.status(200).send({
        ...tokens,
        data: {
          id: user._id,
          userName: user.userName,
          email: user.email,
        },
        message: "User login successfull.",
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        errors: {
          message: "Something went wrong",
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

      console.log("jwt-token==", jwtToken);

      if (!jwtToken) {
        return res.status(400).send({
          message: "Token expired",
          success: false,
        });
      }
      const token = await Jwt.findOne({ uuid: jwtToken.data.uuid });
      if (!token) {
        return res.status(404).send({
          message: "Token doesnot exists",
          success: false,
        });
      }
      if (token.isBlackListed) {
        return res.status(400).send({
          message: "Unable to login. Either token is expired or blacklisted",
          success: false,
        });
      } else {
        const newAccessToken = await generateAccessToken({
          id: jwtToken.data.id,
          userName: jwtToken.data.userName,
          email: jwtToken.data.email,
        });
        return res.status(200).send({
          message: "Access token generated successfully",
          success: true,
          data: {
            accessToken: newAccessToken,
          },
        });
      }
    } catch (error) {
      console.log("error", error);
      res.status(500).send({
        message: "something went wrong",
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
          message: "Token expired",
          success: false,
        });
      }

      const token = await Jwt.findOne({ uuid: jwtToken.data.uuid });

      token.isBlackListed = true;
      await token.save();
      return res.status(200).send({
        message: "User log out successfull",
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  };

  static logoutFromAllDevice = async (req, res) => {
    try {
      await Jwt.updateMany(
        {
          user: req.user.id,
        },
        {
          isBlackListed: true,
        }
      );

      return res.status(200).send({
        message: "Logged out from all devices",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Something went wrong",
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
      console.log("passwordMatch===", passwordMatch);
      if (!passwordMatch) {
        return res.status(400).send({
          success: false,
          message: "Provided password do not match current password",
        });
      }

      currentUser.password = newPassword1;
      await currentUser.save();
      //logout current authenticated user from all device
      if (logoutFromAllDevice) {
        await Jwt.updateMany(
          {
            user: req.user.id,
          },
          {
            isBlackListed: true,
          }
        );
      }

      return res.status(200).send({
        success: true,
        message: "Password change successfull",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  };
}
