const nodemailer = require('nodemailer');
const schedule = require('node-schedule');


function recurMail(startTime, cronStringInterval, mailInfo){
	scheduleMail(startTime, mailInfo);
	schedule.scheduleJob(startTime, function(){
		schedule.scheduleJob(cronStringInterval, function(){
			sendMail(mailInfo);
		})
	});
}

function scheduleMail(startTime, mailInfo){
	const job = schedule.scheduleJob(startTime, function(){
		sendMail(mailInfo);
	})
	console.log(schedule.scheduledJobs);
}

function sendMail(mailInfo){
	console.log('hi');
	// let transporter = nodemailer.createTransport({
	// 	service: 'Gmail',
	// 	auth: {
	// 		user: mailInfo.from,
	// 		pass: mailInfo.pass
	// 	}
	// });

	// let mailOptions = {
	// 	from: mailInfo.from,
	// 	to: mailInfo.to,
	// 	subject: mailInfo.subject,
	// 	text: mailInfo.text,
	// };

	// transporter.sendMail(mailOptions, (error, info) => {
	// 	if(error){
	// 		console.log(error);
	// 	}else{
	// 		console.log('Email send: '+info.response);
	// 	}
	// });
}

module.exports = {
	send: sendMail,
	schedule: scheduleMail,
	recur: recurMail,
}