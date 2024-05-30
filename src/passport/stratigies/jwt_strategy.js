import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { User } from "../../models/user.js";
import passport from "passport";
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

// export const jwtStrategy =
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      console.log("inside try--");
      const user = await User.findOne({ id: jwt_payload._id });
      console.log("user===", user);
      if (user) {
        return done(null, user);
      } else {
        return done("User not found", false);
      }
    } catch (error) {
      cons;
      return done(error, false);
    }
  })
);
