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

      if (!jwtToken) {
        return res.status(400).send({
          message: "Token expired",
          success: false,
        });
      }
      const token = await Jwt.findOne({ token: jwtToken.uuid });
      if (token.isBlackListed) {
        return res.status(400).send({
          message: "Unable to login",
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
    const { uuid } = req.body;

    try {
      const token = await Jwt.findOne({ uuid: uuid });

      const isSameUser = token.user.toString() === req.user.id;
      if (isSameUser) {
        token.isBlackListed = true;
        token.save();
        return res.status(200).send({
          message: "User log out successfull",
          success: true,
        });
      } else {
        return res.status(400).send({
          message: "User cant be logged out",
          success: false,
        });
      }
      res.status(200).send("ok");
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
}
