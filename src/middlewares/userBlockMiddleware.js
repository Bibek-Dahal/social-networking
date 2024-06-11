export const userBlockMiddleware = (req, res, next) => {
  try {
    if (req.user.blockUser) {
      return res.status(400).send({
        message:
          "We are sorry to notify you that you are restricted to access this site. Please contact support for further information.",
        success: false,
      });
    }
    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};
