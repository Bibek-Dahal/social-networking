export class UserController {
  static getLoggedInUser = (req, res) => {
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
  };
}
