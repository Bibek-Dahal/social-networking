import passport from "passport";
export const authMiddleware = (req, res, next) => {
  console.log("auth middleware called");
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.log("auth error==", err);
      return res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
    if (!user) {
      return res.status(401).send({
        message: "Unauthorized",
        success: false,
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).send({
        message: "Email not verified. Please verify your email",
        success: false,
      });
    }
    // console.log("blockUser===", user.blockUser);
    if (user.blockUser) {
      return res.status(400).send({
        message:
          "We are sorry to notify you that you are restricted to access this site. Please contact support for further information.",
        success: false,
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
