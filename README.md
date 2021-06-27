# ClockPost

### Team members
*   Team Members - <a href="https://github.com/Anurps9"> Anurag Sisodiya</a>, <a href="https://github.com/eshasachan18"> Esha Sachan</a>, <a href="https://github.com/Meenu-Yadav">Meenu Yadav</a>

## Features Implemented-
1. Implemented login and signup via username-password and gmail.
2. Implemented the create/edit mail feature.
3. Have home page and history page for all the mails that have been scheduled for future and the ones that have been sent till now.
4. Recurring mails have been implemented.
5. MongoDb connection has been set up.
6. Mails can be send to multiple recepients.
7. App deployed on heroku

*   Deployment link - <a href="https://serene-brook-91484.herokuapp.com/login">Here</a>


## Build Instuctions-
1. Fork and clone the repository
2. Use command 'npm i' in the root directory to install all dependencies
3. Make a .env file in the root directory and put the following variables in it:
	i) clientID: Obtained from Google Developer console
	ii) clientSecret: Also obtained from Google Developer console
	iii) sesseion_secret: A random string to be use as session secret for express-session
	iv) db_url: A MongoDB connection URL
4. Run the app using command 'node app.js' in the root directory
5. In case of deployment, make a Procfile with content: 'web: node app.js' (without inverted commas).

