const url = require('url');
dotenv = require('dotenv');
var express = require('express');
var mysql= require('mysql');
var bodyParser = require('body-parser');
const { Console } = require('console');
const { response } = require('express');
var fs = require("fs");
const { send } = require('process');
const { registerAProfile, updateProfilePicture, loginAProfile, getProfileInformation, setPrivacyOfProfile } = require('./routes/Profile');
const { getAnEvent, getCurrentHappenings, createEvent, addKeywordForAnEvent, deleteAnEvent, updateEvent, addARating, checkEventHappeningNow, getAllAttendeesForAnEvent, joinAnEvent} = require('./routes/Event');
const { addAMessage, AddMessageContact, getAllContacts, deleteAContact, deleteAllMessagesForAContact, getAllMessageForAContact, getAllMessagesBetweenTwoUsers } = require('./routes/Message');
const { addARatingForTable } = require('./routes/Rating');
const { getNotifications, acceptNotification, declineNotification, inviteToEvent } = require('./routes/Notification');
fs.mkdir("Images", () => {
});

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/img', express.static(__dirname + '/Images/'));
var db_config = {
  host: process.env.HOST,
  user: process.env.USERS,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};
function handleDisconnect (req, res, next){
  global.connection = mysql.createConnection(db_config);
  connection.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
    else
    {
      console.log('conecting');
      console.log('Connected as id ' + connection.threadId);
    }
  });
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
      throw err;                                  
    }
  });
  next();
}
app.use(handleDisconnect);
//Put method to update the profile picture of a given user
app.put('/updateProfilePicture', updateProfilePicture);
//Post request for when a user registers with our site, will store their information as well as a hash through bcrypt
//if the username is already registerd in the system will send back 204 status
app.post('/register', registerAProfile);
//Get method to get an Event from an EventID given from the user
app.get('/events/:eventID', getAnEvent);
//Get method to get the currenthappening
app.get('/currenthappening/:userName', getCurrentHappenings);
//Post request to add a message to the database for a given sender and reciever
app.post('/addmessage', addAMessage);
//Post method for when a user creates an Event
app.post('/create', createEvent);
//Post request for when an event adds a keyword to their event
app.post('/event/keywords', addKeywordForAnEvent);
//Put request to check if a user is currently in our system with the password they gave, will send a 200 
//if the password matches the username otherwise sends a 204 if the username or password is incorect
app.put('/login', loginAProfile);
//Updates the rating in the database for a given vibe
app.put('/newrating', addARating);
//Deletes an Event from the Event page for the given id, that's been given by the client
app.put('/deleteEvent', deleteAnEvent);
//Post method to start a new request between a user and someone else
app.post('/messagecontacts/add', AddMessageContact);
//Get method for grabbing the profile information based on the username in the url
app.get('/profile/:username', getProfileInformation);
//Added a get method to get all contacts that a given user has"
app.get("/contacts/:userName", getAllContacts);
//Put request to delete a contact between a user and a reciepient
app.put('/messagescontacts/delete', deleteAContact);
//Put method to updateAnEvent
app.put('/updateevent', updateEvent);
//Put method to delete all messages between a user and another user
app.put('/deletemessagecontacts', deleteAllMessagesForAContact);
//Put method to delete all messages between a user and another user
app.put("/messagecontacts/delete", deleteAllMessagesForAContact);
//Put method to update the privacy of a profile
app.put('/setPrivacy', setPrivacyOfProfile);
//Post method to add a new entry to the Collect Rating Star table
app.post('/addcollectratingtable', addARatingForTable);
//get method to get all the contacts with messages for a given user given through the url
app.get('/messagecontacts/:userName', getAllMessageForAContact);
//Get method to check for the event currently happening now
app.get('/currentevent/:username/:datetime/:latitude/:longitude', checkEventHappeningNow);
//get method to get all notifications
app.get('/notification/:username', getNotifications);
//Put method for a user to accept an invitation
app.put('/accepted', acceptNotification);
//Put method for a user to decline and invitation
app.put('/declined', declineNotification);
//Post method to invite a user to an event
app.post('/invite', inviteToEvent);
//Gets all messages between the senderName and the recieverName
app.get('/messages/:senderName/:recieverName', getAllMessagesBetweenTwoUsers);
//Get all people attending an event
app.get('/getAttendees/:eventID', getAllAttendeesForAnEvent);
//Post method to join an Event
app.post('/joinEvent', joinAnEvent);
//Set the port to listen for the server to listen on
const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server started on port " + port);
});