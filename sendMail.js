const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const {v4: uuidv4} = require('uuid');

function stop(ID){
	schedule.scheduledJobs[ID].cancel();
}

function recurMail(startTime, cronStringInterval, endTime, mailInfo){
	var startID = uuidv4();
	var recurID = uuidv4();
	schedule.scheduleJob(startID, startTime, function(){
		sendMail(mailInfo);
	})
	schedule.scheduleJob(recurID, {start: startTime, end: endTime, rule: cronStringInterval}, function(){
		sendMail(mailInfo);
	});
	return {recurJob: recurID, startJob: startID};
}

function scheduleMail(startTime, mailInfo){
	var startID = uuidv4();
	schedule.scheduleJob(startID, startTime, function(){
		sendMail(mailInfo);
	});
	return {recurJob: '', startJob: startID};
}

function sendMail(mailInfo){
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: mailInfo.from,
			pass: mailInfo.pass,
		},
		tls: {
			rejectUnauthorized: false,
		}
	});

	let mailOptions = {
		from: mailInfo.from,
		to: mailInfo.to,
		cc: mailInfo.cc,
		subject: mailInfo.subject,
		text: mailInfo.text,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if(error){
			console.log(error);
		}else{
			console.log('Email send: '+info.response);
		}
	});
}

module.exports = {
	stop: stop,
	send: sendMail,
	schedule: scheduleMail,
	recur: recurMail,
}