# ClockPost

## Team members
<a href="https://github.com/Anurps9"> Anurag Sisodiya</a>, <a href="https://github.com/eshasachan18"> Esha Sachan</a>, <a href="https://github.com/Meenu-Yadav">Meenu Yadav</a>

## Features
<ol>
1. Login and Signup via username-password and Gmail account.<br>
2. Create/edit mail.<br>
3. List of scheduled mails and mails sent in past.<br>
4. Schedule mail.<br>
5. Recurring mails with options to send at intervals of 30 seconds, one week, one month or one year.<br>
6. CC allowed.<br>
</ol>
	
Deployment link - <a href="https://serene-brook-91484.herokuapp.com/login">Here</a><br>
Look for how to <b>Use</b> before running the link.

## Build Instuctions
<ol>
1. Fork and clone the repository.<br>
2. Use command <b>'npm i'</b> in the root directory to install all dependencies.<br>
3. Make a .env file in the root directory and put the following variables in it:<br>
<ul>
	<li><b>clientID:</b> Obtained from Google Developer console.</li>
	<li><b>clientSecret:</b> Also obtained from Google Developer console.</li>
	<li><b>sesseion_secret:</b> A random string to be use as session secret for 'express-session' package.</li>
	<li><b>db_url:</b> A MongoDB connection URL.</li>
</ul>
4. Run the app using command <b>'node app.js'</b> in the root directory. <br>
5. In case of deployment, you may need to set the 'TZ' config variable of the deployment platform to your timezone.<br> 
</ol>

## Use

Note: Before being able to use, the app you need to make two changes to your Gmail account:<br>
First, turn on <b>'Less secure app'</b> feature.<br>
Second, allow <b>'Display Unlock Captcha'</b>.<br>
You can do Google search for these terms to find the page where you can tweak these settings.<br>
<br>
Now, you are ready to use the app. Go on!

<ol>
1. Login using you Gmail account or in case you want to use username-password strategy then Signup first.<br>
2. The homepage shows all the mails scheduled for future delivery.<br>
3. Click on 'Sent Mail' to see all the mails that have been delivered from your account in the past.<br>
4. Click on 'New message' to compose a new mail.<br>
5. Input your Gmail ID, password for Gmail ID, the recipient address, CC (if required).<br>
6. Select the frequency of mails (once, every 30s, every week, every month or every year).<br>
7. Select the start time at which mails should start to be delivered. Be sure to select a time in the future<br>.
8. Now, select the span for which mails should be continuosly delivered. If you select span 5 minutes and delivery frequency 'every minute', then 5 mails will be delivered at an interval of one minute.<br>
9. Hit 'Send' and that's it!<br>
</ol>

