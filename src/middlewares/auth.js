import passport from "passport";
export const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    console.log("inside authentcate", user);
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
    req.user = user;
    next();
  })(req, res, next);
};
