const nodemailer = require('nodemailer');
const cron = require('node-cron');

function recurMail(cronStringStart, cronStringInterval, cronStringEnd, mailInfo){
	scheduleMail(cronStringStart, mailInfo);
	var recurTask = cron.schedule(cronStringInterval, () => {
		sendMail(mailInfo);
	},{
		scheduled: false
	});

	cron.schedule(cronStringStart, () => {
		recurTask.start();
	},{
		scheduled: true,
		timezone: 'Asia/Colombo',
	})

	cron.schedule(cronStringEnd, () => {
		recurTask.stop();
	},{
		scheduled: true,
		timezone: 'Asia/Colombo',
	})
	return recurTask;
}

function scheduleMail(cronString, mailInfo){
	var task = cron.schedule(cronString, () => {
		sendMail(mailInfo);
	},{
		scheduled: true,
		timezone: 'Asia/Colombo',
	});
	return task;
}

function sendMail(mailInfo){
	// console.log('hi');
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: mailInfo.from,
			pass: mailInfo.pass
		}
	});

	let mailOptions = {
		from: mailInfo.from,
		to: mailInfo.to,
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