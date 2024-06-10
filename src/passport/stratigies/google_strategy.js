import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config";
import { SocialAccountSchema } from "../../models/socialAccount.js";
import { User } from "../../models/user.js";
import { generatePassword } from "../../utils/passwordGenerato.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "http://localhost:8000/api/account/oauth2/redirect/google",
    },
    async function (accessToken, refreshToken, profile, done) {
      let cred = null;

      // console.log("Issuer--", issuer);
      console.log("Profile--", profile);
      const userInfo = profile._json;
      try {
        console.log("inside try--", profile.id, profile.provider);
        cred = await SocialAccountSchema.findOne({
          profileId: profile.id,
          issuer: profile.provider,
        });
        console.log("credential----", cred);
      } catch (error) {
        return done("Cant get social account", false);
      }

      if (!cred) {
        let user = null;
        let socialAccount = null;
        try {
          user = await User.findOne({ email: userInfo.email });

          if (!user) {
            let userName = userInfo.name + userInfo.sub.substring(1, 9);

            user = await User.create({
              userName: userName,
              email: userInfo.email,
              isEmailVerified: userInfo.email_verified,
              password: generatePassword(12),
            });
          }
        } catch (error) {
          return done("Cant create user", null);
        }
        try {
          socialAccount = await SocialAccountSchema.create({
            user: user._id,
            issuer: profile.provider,
            profileId: profile.id,
          });
        } catch (error) {
          return done("Cant create social account", null);
        }

        return done(null, user);
      } else {
        try {
          const user = await User.findById(cred.user);
          return done(null, user);
        } catch (error) {
          return done("User not found with given id", false);
        }
      }

      // db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
      //   issuer,
      //   profile.id
      // ], function(err, cred) {
      //   if (err) { return done(err); }
      //   if (!cred) {
      //     // The Google account has not logged in to this app before.  Create a
      //     // new user record and link it to the Google account.
      //     db.run('INSERT INTO users (name) VALUES (?)', [
      //       profile.displayName
      //     ], function(err) {
      //       if (err) { return done(err); }

      //       var id = this.lastID;
      //       db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
      //         id,
      //         issuer,
      //         profile.id
      //       ], function(err) {
      //         if (err) { return done(err); }
      //         var user = {
      //           id: id.toString(),
      //           name: profile.displayName
      //         };
      //         return done(null, user);
      //       });
      //     });
      //   } else {
      //     // The Google account has previously logged in to the app.  Get the
      //     // user record linked to the Google account and log the user in.
      //     db.get('SELECT * FROM users WHERE id = ?', [ cred.user_id ], function(err, user) {
      //       if (err) { return done(err); }
      //       if (!user) { return done(null, false); }
      //       return done(null, user);
      //     });
      //   }
      // };
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
