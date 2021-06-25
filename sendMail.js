const nodemailer = require('nodemailer');

function sendMail(from, pass, to, subject, text){
	console.log('hi');
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: from,
			pass: pass
		}
	});

	let mailOptions = {
		from: from,
		to: to,
		subject: subject,
		text: text,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if(error){
			console.log(error);
		}else{
			console.log('Email send: '+info.response);
		}
	});
}

module.exports.send = sendMail;