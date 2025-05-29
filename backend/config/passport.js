const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const User = require("../models/User");

passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          username: profile.id,
          email,
          role: "Member",
        });
      }
      done(null, user);
    }
  )
);
