const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: "611038383097-3884dt73hdju0akd4794m2ktfsqmt8gl.apps.googleusercontent.com",
    clientSecret: "6tDK4MSPyX0ryfbXRNqrQNCG",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
       // User.findOrCreate({ googleId: profile.id }, function (err, user) {
       //   return done(err, user);
       // });
       console.log(profile.id);
  }
))

