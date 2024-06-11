import { Jwt } from "../../models/jwtTokens.js";
import { User } from "../../models/user.js";
import { paginate } from "../../utils/pagination.js";
import { prepareSearchQuery } from "../../utils/prepareSearchQuery.js";
export class AdminUserController {
  static listAllUser = async (req, res) => {
    try {
      const searchFields = ["userName", "email"];
      let filterQuery = {};
      let sq = prepareSearchQuery(req, searchFields);
      if (sq) {
        filterQuery = { ...filterQuery, ...sq };
      }
      const query = User.find(filterQuery, { password: 0 }).populate(
        "postCount"
      );
      const { data, count } = await paginate({
        req,
        model: User,
        filterQuery,
        query,
      });
      if (req.query.sort == "postCount") {
        data.sort((a, b) => b.postCount - a.postCount);
      } else if (req.query.sort == "-postCount") {
        data.sort((a, b) => a.postCount - b.postCount);
      }
      // await User.find({}, { password: 0 }).populate("postCount");
      res.status(200).send({
        success: true,
        count: count,
        data: data,
        message: "User fetched successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };
  static getUserByid = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).populate("postCount");
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
      console.log("postCount==", await user.postCount);
      return res.status(200).send({
        message: "User fetched successfully",
        data: user,
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static createUser = async (req, res) => {
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
      console.log(error);
      res.status(500).send({
        errors: {
          message: "Something went wrong",
          success: false,
        },
      });
    }
  };

  static updateUser = async (req, res) => {
    const { userId } = req.params;
    try {
      const userToBeUpdated = await User.findById(userId);
      if (!userToBeUpdated) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      const userWithUserName = await User.findOne({
        $and: [
          { userName: req.body.userName },
          { _id: { $ne: userToBeUpdated._id } },
        ],
      });
      const userWithEmail = await User.findOne({
        $and: [
          { email: req.body.email },
          { _id: { $ne: userToBeUpdated._id } },
        ],
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

      await userToBeUpdated.updateOne(req.body);
      if (req.body.blockUser === true) {
        await Jwt.updateMany({ user: req.user.id }, { isBlackListed: true });
      }
      res.status(200).send({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        errors: {
          message: "Something went wrong",
          success: false,
        },
      });
    }
  };

  static deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).send({
          message: "Cant find user to delete",
          success: false,
        });
      }
      return res.status(200).send({
        success: true,
        message: "User deleted successfully",
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
