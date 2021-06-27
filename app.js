const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mail = require('./sendMail.js');
const path = require('path');
const date = require('date-and-time');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const saltRounds = 10;

if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
	secret: "This is the secret",
	resave: true,
	saveUninitialized: true,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

passport.serializeUser(function(user, done ){
	done(null, user);
});

passport.deserializeUser(function(user, done){
	done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOne({ googleId: profile.id }, function (err, user) {
       	 if(err){
       	 	return done(err);
       	 }
       	 if(!user){
       	 	const newUser=new User({
       	 		googleId: profile.id,
       	 		outbox: [],
       	 	});
       	 	newUser.save((err, newUser) => {
       	 		console.log(newUser.outbox);
       	 	})
       	 }
         return done(null, user);
       });
  }
))

passport.use('local-login', new LocalStrategy(

  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
				console.log('in');
        return done(null, false, { message: 'Incorrect username.' });
      }
      bcrypt.compare(password, user.password, function(err, result){
      	console.log(result);
	      if (!result) {
	        return done(null, false, { message: 'Incorrect password.' });
	      }
	      return done(null, user);
      })
    });
  }

))

passport.use('local-signup', new LocalStrategy(

	function(username, password, done){

		User.findOne({username: username}, function(err, user){
			if(err) return done(err);
			if(user){
				return done(null, false, req.flash('signupMessage', 'Email Already Taken!'))
			}
			bcrypt.hash(password, saltRounds, (err, hash) => {
				var newUser = new User({
					username: username,
					password: hash,
				})	
				newUser.save(function(err, newUser){
					if(err) {return done(err);}
					console.log('saved');
					return done(null, newUser);
				})
			}) 
		})		

	}

))

//database
const uri = 'mongodb+srv://admin-anurag:test123@cluster0.mp2lc.mongodb.net/Users?retryWrites=true&w=majority'
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to database');
});
const UserSchema = new mongoose.Schema({
	username: String,
	googleId: String,
	password: String,
	outbox: [],
	recuringTask: [],
	scheduledTask: [],
});

const User = mongoose.model('User', UserSchema);

//routes

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
  	req.session.loggedIn = true;
    res.redirect('/');
});

app.get('/', (req, res) => {
	if(req.session.loggedIn){
		User.findOne({_id: req.session.passport.user._id}, function(err, user) {
			res.render('index', {tasks: user.scheduledTask});
		});
	}else{
		res.redirect('/login');
	}
});

app.post('/', (req, res) => {
	req.session.destroy();
	res.redirect('/');
})

app.get('/signup', (req, res) => {
	res.render('signup');
})

app.post('/signup', 
	passport.authenticate('local-signup', 
	{
		failureRedirect: '/signup',
		failureFlash: true
	}),	
	(req, res) => {
		req.session.loggedIn = true;
		res.redirect('/');
	}
)

app.get('/login', (req, res) => {
	res.render('login');
})

app.post('/login',
  passport.authenticate('local-login', 
  { 
  	failureRedirect: '/login',
   	failureFlash: true 
  }),
  (req, res) => {
  	req.session.loggedIn = true;
  	res.redirect('/');
  }
);

app.get('/mailScreen', (req, res) => {
	if(req.session.loggedIn == true){
		res.render('mailScreen');
	}else{
		res.redirect('/login');
	}
})

app.post('/mailScreen', (req, res) => {

	//'YYYY MM DD HH mm ss SSS'
	var dateTo = new Date(req.body.scheduleStartTime);
	var mailInfo = {
		from: req.session.passport.user.username,
		to: req.body.receiverEmail,
		text: req.body.text,
		pass: req.session.passport.user.password,
		subject: '',
	}

	var user = req.session.passport.user;
	console.log(user._id);
	User.findOne({_id: user._id}, function(err, user) {
		user.outbox.push(mailInfo);
		user.save();
	});

	var interval = req.body.interval;
	var cronStringStart=date.format(dateTo, 'ss mm HH DD MM *');
	console.log(dateTo);
	

	if(interval.localeCompare('once')==0){
		//Send mail once
		User.findOne({_id: user._id}, function(err, user) {
			if(!user){
				res.redirect('/signup');
			}else{
				var task = {
					mailInfo: mailInfo,
					task: mail.schedule(cronStringStart, mailInfo),
				}
				user.scheduledTask.push(task);
				user.save();
			}
		});
	}else{
		//Recur mail after specified time
		var cronStringInterval; 
		dateTo.setTime(dateTo.getTime() + (30*60*1000));
		
		var cronStringEnd = date.format(dateTo, 'ss mm HH DD MM *');

		if(interval.localeCompare('every-minute')==0){
			cronStringInterval = '* * * * *';
		}else if(interval.localeCompare('every-week')==0){
			cronStringInterval = '* * * * 1';
		}else if(interval.localeCompare('every-month')==0){
			cronStringInterval = '* * 1 * *';
		}else if(interval.localeCompare('every-year')==0){
			cronStringInterval = '* * * 1 *';
		}
		User.findOne({_id: user._id}, function(err, user) {
			if(!user){
				res.redirect('/signup');
			}else{
				var task = {
					mailInfo: mailInfo,
					task: mail.recur(cronStringStart, cronStringInterval, cronStringEnd, mailInfo),
				}
				user.recurTask.push(task);
				user.save();
			}
		});
	}

	res.redirect('/mailScreen');
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('server start at port '+port);
})


