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
    //Note always use findById for querying with id
    // console.log(jwt_payload);
    try {
      const user = await User.findById(jwt_payload.data.id);

      if (user) {
        return done(null, user);
      } else {
        return done("User not found", false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
