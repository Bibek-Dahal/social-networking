import { FollowRequest } from "../models/followRequest.js";
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

  // static followUser = async (req, res) => {
  //   const { userId } = req.params;
  //   try {
  //     console.log(req.user);
  //     const userToFollow = await User.findById(userId);

  //     if (userToFollow) {
  //       //get followers of user to be followed
  //       const followersOfUserToFollow = userToFollow.followers.map((item) =>
  //         item.toString()
  //       );

  //       if (followersOfUserToFollow.includes(req.user.id)) {
  //         //if followers already includes current user id do not add follower
  //         return res.status(400).send({
  //           message: "Already in list of follower of following user",
  //           success: false,
  //         });
  //       } else {
  //         userToFollow.followers.push(req.user._id);
  //         userToFollow.save();
  //       }

  //       const userCurrentFollowings = req.user.following.map((item) =>
  //         item.toString()
  //       );
  //       console.log(userCurrentFollowings);

  //       if (userCurrentFollowings.includes(userId)) {
  //         return res.status(400).send({
  //           message: "Already following user",
  //           success: false,
  //         });
  //       } else {
  //         userCurrentFollowings.push(userToFollow._id);
  //         const userToBeUpdated = req.user;

  //         userToBeUpdated.following = userCurrentFollowings;
  //         userToBeUpdated.save();
  //         return res.status(200).send({
  //           message: "follower added successfully",
  //           success: true,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send({
  //       message: "something went wrong",
  //       success: false,
  //     });
  //   }
  // };

  // static unfollowUser = async (req, res) => {
  //   const { userId } = req.params;
  //   try {
  //     console.log(req.user);
  //     const userToFollow = await User.findById(userId);

  //     if (userToFollow) {
  //       //get followers of user to be followed
  //       const followersOfUserToFollow = userToFollow.followers.map((item) =>
  //         item.toString()
  //       );

  //       if (!followersOfUserToFollow.includes(req.user.id)) {
  //         //if followers already includes current user id do not add follower
  //         return res.status(400).send({
  //           message: "User is not in follower list",
  //           success: false,
  //         });
  //       } else {
  //         const valueIndex = userToFollow.followers.indexOf(req.user._id);
  //         userToFollow.followers.splice(valueIndex, 1);
  //         userToFollow.save();
  //       }

  //       const userCurrentFollowings = req.user.following.map((item) =>
  //         item.toString()
  //       );
  //       console.log(userCurrentFollowings);

  //       if (!userCurrentFollowings.includes(userId)) {
  //         return res.status(400).send({
  //           message: "Userid not in list of following",
  //           success: false,
  //         });
  //       } else {
  //         const currentIndex = userCurrentFollowings.indexOf(userToFollow._id);
  //         userCurrentFollowings.splice(currentIndex, 1);
  //         const userToBeUpdated = req.user;

  //         userToBeUpdated.following = userCurrentFollowings;
  //         userToBeUpdated.save();
  //         return res.status(200).send({
  //           message: "following removed successfully",
  //           success: true,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send({
  //       message: "something went wrong",
  //       success: false,
  //     });
  //   }
  // };

  static getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
      console.log("get user by id");
      const user = await User.findById(userId, { password: 0 }).populate(
        "profile",
        "avatar bio hobbies"
      );
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).send({
        success: true,
        message: "User found",
        data: user,
      });
    } catch (error) {
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static followUnfollowRequest = async (req, res) => {
    const { userId } = req.params;
    try {
      if (userId === req.user.id) {
        return res.status(400).send({
          success: false,
          message: "Cant follow to own id",
        });
      }

      const followreq = await FollowRequest.findOne({
        sender: req.user.id,
        receiver: userId,
      });
      if (req.user.following.includes(userId)) {
        return res.status(400).send({
          success: false,
          message: "Already following user",
        });
      }
      if (followreq) {
        const deletedItem = await FollowRequest.deleteOne({
          _id: followreq.id,
        });
        if (deletedItem) {
          return res.status(200).send({
            success: true,
            message: "Follow request unsent",
          });
        } else {
          return res.status(404).send({
            success: true,
            message: "Follow request not found",
          });
        }
      } else {
        await FollowRequest.create({
          sender: req.user.id,
          receiver: userId,
        });
        return res.status(200).send({
          success: true,
          message: "Follow request sent",
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static listFollowRequest = async (req, res) => {
    console.log("list follow called");
    try {
      const followRequests = await FollowRequest.find({
        receiver: req.user.id,
      })
        .select("sender")
        .populate({
          path: "sender",
          select: "userName email profile",
          populate: { path: "profile", select: "bio avatar" },
        });

      res.status(200).send({
        success: true,
        data: followRequests,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static acceptFollowRequest = async (req, res) => {
    const { userId } = req.params;
    try {
      const followReqObj = await FollowRequest.findOne({
        sender: userId,
        receiver: req.user.id,
      });
      if (!followReqObj) {
        return res.status(404).send({
          success: false,
          message: "No follow request exists",
        });
      }

      const user = req.user;

      user.followers.push(userId);
      await user.save();
      const followRequstingUser = await User.findById(userId);
      if (!this.followUnfollowRequest) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
      followRequstingUser.following.push(req.user.id);
      await followRequstingUser.save();
      await FollowRequest.deleteOne({ _id: followReqObj.id });
      return res.status(200).send({
        success: true,
        message: "Follow request accepted",
      });
    } catch (error) {
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static deleteFollowRequest = async (req, res) => {
    const { userId } = req.params;
    try {
      const followReqObj = await FollowRequest.findOne({
        sender: userId,
        receiver: req.user.id,
      });
      if (!followReqObj) {
        return res.status(404).send({
          success: false,
          message: "No follow request exists",
        });
      }

      await FollowRequest.deleteOne({ _id: followReqObj.id });
      res.status(200).send({
        success: true,
        message: "Follow request unsent",
      });
    } catch (error) {
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static listUserToFollow = async (req, res) => {
    try {
      const users = await User.find({
        $and: [
          { _id: { $ne: req.user.id } },
          { _id: { $nin: req.user.following } },
        ],
      });
      return res.status(200).send({
        success: true,
        data: users,
        message: "User fetched successfully",
      });
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
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
      if (!req.user.following.includes(userId)) {
        return res.status(400).send({
          success: false,
          message: "Cant unfollow user. Not in following list",
        });
      }

      req.user.following.splice(req.user.following.indexOf(userId), 1);
      await req.user.save();
      res.status(200).send({
        success: true,
        message: "User unfollowed",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static listUserFollowing = async (req, res) => {
    try {
      const users = await User.find(
        {
          _id: { $in: req.user.following },
        },
        { password: 0 }
      ).populate("profile");
      console.log(users);
      res.status(200).send({
        message: "Followings fetched successfully",
        success: true,
        data: users,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };

  static listUserFollowers = async (req, res) => {
    try {
      const users = await User.find(
        {
          _id: { $in: req.user.followers },
        },
        { password: 0 }
      ).populate("profile");
      console.log(users);
      res.status(200).send({
        message: "Followers fetched successfully",
        success: true,
        data: users,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "something went wrong",
        success: false,
      });
    }
  };
}
