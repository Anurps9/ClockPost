const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mail = require('./sendMail.js');
const path = require('path');
const cron = require('node-cron');
const date = require('date-and-time');

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


app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

//2000-03-12T12:23
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/src/index.html'));
});

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

	//'YYYY MM DD HH mm ss SSS'
	var dateTo = new Date(req.body.scheduleStartTime);
	var mailInfo = {
		from: req.body.senderEmail,
		to: req.body.receiverEmail,
		text: req.body.text,
		pass: '#include',
		subject: '',
	}

	var interval = req.body.interval;
	var cronStringStart=date.format(dateTo, 'ss mm HH DD MM *');
	
	if(interval.localeCompare('once')==0){
		//Send mail once
		mail.schedule(cronStringStart, mailInfo);
	}else{
		//Recur mail after specified time

		var cronStringInterval;

		if(interval.localeCompare('every-minute')==0){
			cronStringInterval = '* * * * *';
		}else if(interval.localeCompare('every-second')==0){
			cronStringInterval = '* * * * * *';
		}else if(interval.localeCompare('every-hour')==0){
			cronStringInterval = '* 1 * * *';
		}else if(interval.localeCompare('every-day')==0){
			cronStringInterval = '* * 1 * *';
		}else if(interval.localeCompare('every-month')==0){
			cronStringInterval = '* * * 1 *';
		}
		mail.recur(cronStringStart, cronStringInterval, mailInfo);
	}

	res.redirect('/mailScreen');
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('server start at port 3000');
})


