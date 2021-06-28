# ClockPost

## Team members
<a href="https://github.com/Anurps9"> Anurag Sisodiya</a>, <a href="https://github.com/eshasachan18"> Esha Sachan</a>, <a href="https://github.com/Meenu-Yadav">Meenu Yadav</a>

## Features
1. Login and Signup via username-password and Gmail account.
2. Create/edit mail.
3. List of scheduled mails and mails sent in past.
4. Schedule mail.
5. Recurring mails with options to send at intervals of one minute, one week, one month or one year.
6. CC allowed.

Deployment link - <a href="https://serene-brook-91484.herokuapp.com/login">Here</a>

## Build Instuctions
1. Fork and clone the repository.
2. Use command 'npm i' in the root directory to install all dependencies.
3. Make a .env file in the root directory and put the following variables in it:<br>
	i) clientID: Obtained from Google Developer console.<br>
	ii) clientSecret: Also obtained from Google Developer console.<br>
	iii) sesseion_secret: A random string to be use as session secret for 'express-session' package.<br>
	iv) db_url: A MongoDB connection URL.<br>
4. Run the app using command 'node app.js' in the root directory.
5. In case of deployment, you may need to set the 'TZ' config variable to your respective timezone. 

## Use

Note: Before being able to use, the app you need to make two changes to your Gmail account:<br>
First, turn on 'Less secure app' feature.<br>
Second, allow 'Display Unlock Captcha'.<br>
You can do Google search for these terms to find the page where you can tweak these settings<br>.
<br>
Now, you are ready to use the app. Go on!

1. Login using you Gmail account or in case you want to use username-password strategy then Signup first.
2. The homepage shows all the mails scheduled for future delivery.
3. Click on 'Sent Mail' to see all the mails that have been delivered from your account in the past.
4. Click on 'New message' to compose a new mail.
5. Input your Gmail ID, password for Gmail ID, the recipient address, CC (if required).
6. Select the frequency of mails (once, every minute, every week, every month or every year).
7. Select the start time at which mails should start to be delivered. Be sure to select a time in the future.
8. Now, select the span for which mails should be continuosly delivered. If you select span 5 minutes and delivery frequency 'every minute', then 5 mails will be delivered at an interval of one minute.
9. Hit 'Send' and that's it!

