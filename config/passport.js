import passport from "passport";
import GoogleStrategy from "passport-google-oidc";
import User from "../models/User.js";
import mongoose from "mongoose";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["openid", "email", "profile"],
    },
    async (issuer, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName?.trim();
        const email = profile.emails?.[0]?.value;

        if (!googleId || !name || !email) {
          return done(
            new Error("Google profile is missing required account details."),
          );
        }

        const user = await User.findOneAndUpdate(
          { googleId },
          { $set: { name, email }, $setOnInsert: { googleId } },
          { upsert: true, new: true, runValidators: true },
        );

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!mongoose.isValidObjectId(id)) return done(null, false);
    const user = await User.findById(id);
    return done(null, user || false);
  } catch (error) {
    return done(error);
  }
});

export default passport;
