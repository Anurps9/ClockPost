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
const {v4: uuidv4} = require('uuid');

if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
	secret: process.env.session_secret,
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
       	 		scheduledTask: [],
       	 	});
       	 	newUser.save();
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
	firstname: String, 
	lastname: String,
	username: String,
	googleId: String,
	password: String,
	outbox: [],
	scheduledTask: [],
	history: [],
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
			if(!user){
				res.render('/');
			}
			var curr = new Date();
			var tasks = [];
			user.scheduledTask.forEach((task) => {
				if(task.mailInfo.scheduledTime.getTime() > curr.getTime()){
					tasks.push(task)
				}else{
					user.history.push(task);
				}
			})
			user.scheduledTask = tasks;
			user.save();
			res.render('index', {username: user.firstname || user.googleId, tasks: user.scheduledTask});
		});
	}else{
		res.redirect('/login');
	}
});

app.post('/logout', (req, res) => {
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
	var user = req.session.passport.user;
	User.findOne({_id: user._id}, function(err, user) {

			if(!user) {
				res.redirect('/signup');
			}

			var dateTo = new Date(req.body.scheduleStartTime);
			
			var mailInfo = {
				from: req.body.senderEmail,
				to: req.body.receiverEmail,
				text: req.body.text,
				pass: req.body.senderPass,
				subject: req.body.subject,
				scheduledTime: dateTo,
			}

			var task = {
				task_id: uuidv4(),
				mailInfo: mailInfo,
			}

			var interval = req.body.interval;
			var cronStringStart=date.format(dateTo, 'ss mm HH DD MM *');	
			if(interval.localeCompare('once')==0){
				//Send mail once
				task.mailInfo.recurrence = 'Once';
				mail.schedule(dateTo, mailInfo);
			}else{
				//Recur mail after specified time
				var cronStringInterval; 
				if(interval.localeCompare('every-minute')==0){
					task.mailInfo.recurrence = 'Every minute';
					cronStringInterval = '* * * * *';
				}else if(interval.localeCompare('every-week')==0){
					task.mailInfo.recurrence = 'Every week';
					cronStringInterval = '* * * * 1';
				}else if(interval.localeCompare('every-month')==0){
					task.mailInfo.recurrence = 'Every month';
					cronStringInterval = '* * 1 * *';
				}else if(interval.localeCompare('every-year')==0){
					task.mailInfo.recurrence = 'Every year';
					cronStringInterval = '* * * 1 *';
				}

				mail.recur(dateTo, cronStringInterval, mailInfo);					
			}
			task.mailInfo.pass = '#';
			user.scheduledTask.push(task);
			user.save();

	}).then( () => {
			res.redirect('/');
		}
	);

})

app.get('/history', function(req, res) {
	if(req.session.loggedIn){
		User.findOne({_id: req.session.passport.user._id}, function(err, user) {
			if(!user){
				res.render('/');
			}
			var curr = new Date();
			var tasks = [];
			user.scheduledTask.forEach((task) => {
				if(task.mailInfo.scheduledTime.getTime() > curr.getTime()){
					tasks.push(task)
				}else{
					user.history.push(task);
				}
			})
			user.scheduledTask = tasks;
			user.save();
			res.render('history', {username: user.username || user.googleId, tasks: user.history});
		});
	}else{
		res.redirect('/login');
	}
})

/*
const UserSchema = new mongoose.Schema({
	username: String,
	googleId: String,
	password: String,
	outbox: [],
	scheduledTask: [],
});
*/
app.get("/delete/:task_id", function(req, res){
	User.findOne({_id: req.session.passport.user._id}, function(err, user) {
		var index = user.scheduledTask.findIndex((task) => {
			return task.task_id == req.params.task_id;
		})
		user.scheduledTask.splice(index, 1);
		user.save();
	}).then(() => {
		res.redirect('/');
	});
})

app.get("/delete/history/:task_id", function(req, res){
	User.findOne({_id: req.session.passport.user._id}, function(err, user) {
		var index = user.history.findIndex((task) => {
			return task.task_id == req.params.task_id;
		})
		user.history.splice(index, 1);
		user.save();
	}).then(() => {
		res.redirect('/history');
	});
})

app.get('/askForName', function(req, res){
	res.render('askForName');
})

app.post('/askForName', function(req, res){
	User.findOne({_id: req.session.passport.user._id}, function(err, user) {
		user.firstname=req.body.name;
		user.save();
	}).then(() => {
		res.redirect('/');
	});
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('server start at port '+port);
})


