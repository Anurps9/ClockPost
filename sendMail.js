const nodemailer = require('nodemailer');
const schedule = require('node-schedule');


function recurMail(startTime, cronStringInterval, endTime, mailInfo){
	scheduleMail(startTime, mailInfo);
	schedule.scheduleJob({start: startTime, end: endTime, rule: cronStringInterval}, function(){
		sendMail(mailInfo);
	});
}

function scheduleMail(startTime, mailInfo){
	const job = schedule.scheduleJob(startTime, function(){
		sendMail(mailInfo);
	})
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
	send: sendMail,
	schedule: scheduleMail,
	recur: recurMail,
}