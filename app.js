const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mail = require('./sendMail.js');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));


/************OAuth**********/

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

/**************************/

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/src/index.html'))
})

app.post('/', (req, res) => {
	
})

app.get('/signup', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/src/signup.html'));
})

app.post('/signup', (req, res) => {

})

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/src/login.html'));
})


app.post('/login', (req, res) => {
	
})

app.get('/mailScreen', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/src/mailScreen.html'));
})

app.post('/mailScreen', (req, res) => {
	let sender = req.body.senderEmail;
	let receiver = req.body.receiverEmail;
	let text = req.body.text;
	mail.send(sender, '', receiver, 'nothing', text);
	res.redirect('/mailScreen');
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('server start at port 3000');
})


