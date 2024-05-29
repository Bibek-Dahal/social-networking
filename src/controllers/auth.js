import { User } from "../models/user.js";
import { Jwt } from "../models/jwtTokens.js";
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
        token: tokens.refreshToken,
      });

      console.log(tokens);

      res.status(200).send({
        ...tokens,
        user: {
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
}
