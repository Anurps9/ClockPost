const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mail = require('./sendMail.js');

const path = require('path');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));

app.post('/mailScreen', (req, res) => {
	let sender = req.body.senderEmail;
	let receiver = req.body.receiverEmail;
	let text = req.body.text;
	mail.send(sender, '', receiver, 'nothing', text);
	res.redirect('/mailScreen');
})

app.get('/mailScreen', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/src/mailScreen.html'));
})

app.get('/', (req, res) => {
	res.send('Hello');
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('server start at port 3000');
})


