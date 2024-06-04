import { User } from "../models/user.js";
export class UserController {
  static getLoggedInUser = (req, res) => {
    try {
      // console.log(req.user);
      const user = req.user;
      const data = {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      res.status(200).send({
        data: data,
        success: true,
        message: "User info",
      });
    } catch (error) {
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static followUser = async (req, res) => {
    const { userId } = req.params;
    try {
      console.log(req.user);
      const userToFollow = await User.findById(userId);

      if (userToFollow) {
        //get followers of user to be followed
        const followersOfUserToFollow = userToFollow.followers.map((item) =>
          item.toString()
        );

        if (followersOfUserToFollow.includes(req.user.id)) {
          //if followers already includes current user id do not add follower
          return res.status(400).send({
            message: "Already in list of follower of following user",
            success: false,
          });
        } else {
          userToFollow.followers.push(req.user._id);
          userToFollow.save();
        }

        const userCurrentFollowings = req.user.following.map((item) =>
          item.toString()
        );
        console.log(userCurrentFollowings);

        if (userCurrentFollowings.includes(userId)) {
          return res.status(400).send({
            message: "Already following user",
            success: false,
          });
        } else {
          userCurrentFollowings.push(userToFollow._id);
          const userToBeUpdated = req.user;

          userToBeUpdated.following = userCurrentFollowings;
          userToBeUpdated.save();
          return res.status(200).send({
            message: "follower added successfully",
            success: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static unfollowUser = async (req, res) => {
    const { userId } = req.params;
    try {
      console.log(req.user);
      const userToFollow = await User.findById(userId);

      if (userToFollow) {
        //get followers of user to be followed
        const followersOfUserToFollow = userToFollow.followers.map((item) =>
          item.toString()
        );

        if (!followersOfUserToFollow.includes(req.user.id)) {
          //if followers already includes current user id do not add follower
          return res.status(400).send({
            message: "User is not in follower list",
            success: false,
          });
        } else {
          const valueIndex = userToFollow.followers.indexOf(req.user._id);
          userToFollow.followers.splice(valueIndex, 1);
          userToFollow.save();
        }

        const userCurrentFollowings = req.user.following.map((item) =>
          item.toString()
        );
        console.log(userCurrentFollowings);

        if (!userCurrentFollowings.includes(userId)) {
          return res.status(400).send({
            message: "Userid not in list of following",
            success: false,
          });
        } else {
          const currentIndex = userCurrentFollowings.indexOf(userToFollow._id);
          userCurrentFollowings.splice(currentIndex, 1);
          const userToBeUpdated = req.user;

          userToBeUpdated.following = userCurrentFollowings;
          userToBeUpdated.save();
          return res.status(200).send({
            message: "following removed successfully",
            success: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };
}
