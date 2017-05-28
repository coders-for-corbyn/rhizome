# Rhizome
The API that feeds grass roots movements.

# What's New
### version: 1.2.0
- REST app refactored for scale using cluster.
- Simplified app.js, bootstrap updated.

### 1.1.0
- Web Sockets refactored for scale. 
- Now uses redis to co-ordinate multiple socket servers.
- Socket Server is broken out into its own app.

### 1.0.6
- Added some fields to post to support ugc.

### 1.0.5
- Logging in can update all related authenticating app (twitter, facebook, google, etc...) info not just the token 


## Prerequisites ##
You'll need gulp:
`npm install -g gulp && npm install gulp`

You'll need nodemon:
`npm install -g nodemon`

Then you'll need to grab the latest modules:
`npm install`

You'll need redis installed:
`$ sudo add-apt-repository ppa:chris-lea/redis-server
 $ sudo apt-get update
 $ sudo apt-get install redis-server`

## Configuring ##
You need to setup an environment variable: `SERVER_ID`
Add `export SERVER_ID = 'name'` to your .profile or .bashrc

Then add to config.json.
## Building ##
`npm run build`
`npm start`; or
`npm run dev`
## Testing ##
Need someone to take ownership of unit tests.
## To Do ##
- ~~Convert to ES6~~
- Make it run in a docker instance
- Dependency on local MongoDB. Need a better solution than that. Docker?
- Everything!
