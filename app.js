const url = require('url');
dotenv = require('dotenv');
const bcrypt = require('bcrypt');
var express = require('express');
var fs = require("fs");
var mysql= require('mysql');
var bodyParser = require('body-parser');
const { Console } = require('console');
const { response } = require('express');
var salt = bcrypt.genSaltSync(10);
fs.mkdir("Images", () => {
});

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/img', express.static(__dirname + '/Images/'));
app.use(function(req, res, next){
 	global.connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERS,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    queryTimeout: 60000 
  });
	connection.connect(function (err) {
    console.log('conecting');
    if (err) {
        console.error('Error connecting: ' + err.stack);
    }

    console.log('Connected as id ' + connection.threadId);
  });
	next();
});
app.post('/test/registerPicture', (req, res) => {
  var userName = req.body.user.username;
  var profilePicture = req.body.user.profilePicture;
  var filePath = 'test.jpg'
  saveArrayAsFile(profilePicture, '/Images/' + filePath);
  filePath = "http://192.168.1.105:3000/img/" + filePath;
  connection.query('insert into test(userName, profilePicture) values(?, ?)', [userName, filePath], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });

});
app.post('/test', (req, res) => {
  var userName = req.body.user.username;
  connection.query('select userName, profilePicture from test', [userName], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result))
    }
  });
});
//Post request for when a user registers with our site, will store their information as well as a hash through bcrypt
//if the username is already registerd in the system will send back 204 status
app.post('/register', (request, response, next) => {
  var hash = bcrypt.hashSync(request.body.user.password, salt);
  var userEmail = request.body.user.email;
  var userName = request.body.user.username;
  var profilePicture = request.body.user.profilepicture;
  connection.query('INSERT into Users(userEmail, Password, userName, ProfilePicture) Values(?, ?, ?, ?)', [userEmail, hash, userName, profilePicture], function(error, result, fields){
    if(error)
    {
        if(error.errno == 1062)
        {
            response.sendStatus(204);
        }
        else
        {
            response.sendStatus(500);
        }
      
    }
    else {
      response.sendStatus(200);
    }
  });
});
//Get method to get an Event from an EventID given from the user
app.get('/events/:eventID', (req, res) =>{
  var eventID = req.params.eventID;
  connection.query('select Events.EventID as ID, Events.Title as EventTitle, Events.Image as EventImage, Events.Location as EventLocation, Events.EventLatitude, Events.EventLongitude, Events.Vibe as EventVibe, Events.StartDate as EventStartDate, Events.EndDate as EventEndDate, Events.Category as EventCategory, Users.userName as UserName from Events join Users on (userID = Events.HostUserID) where Events.EventID = ?',[eventID], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result[0]));
    }
  });
});
app.get('/currenthappening', (req, res) => {
  connection.query('select a.EventID as ID, a.Title as EventTitle, a.Image as EventImage, a.Location as EventLocation, a.EventLatitude, a.EventLongitude, a.Vibe as EventVibe, a.StartDate as EventStartDate, a.EndDate as EventEndDate, a.Category as EventCategory, a.EventKeywords, Users.userName as UserName from (select Events.EventID, Title, Image, Location, EventLatitude, EventLongitude, Vibe, StartDate, EndDate, Category, HostUserID, group_concat(keyword) as EventKeywords from Keywords join Events on (Keywords.EventID = Events.EventID) group by EventID) as a join Users on (userID = a.HostUserID) limit 4', function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result));
    }
  });
});

//Post request to add a message to the database for a given sender and reciever
app.post('/addmessage', (req, res) => {
    var senderName = req.body.message.senderusername;
    var RecieverName = req.body.message.receiverusername;
    var messageContent = req.body.message.messagecontent;
    connection.query('insert into Messages(SenderUserID, RecieverUserID, Message) values((select userID from Users where userName = ?), (select userID from Users where userName = ?), ?)', [senderName, RecieverName, messageContent], function(error, result, fields){
      if(error)
      {
          res.sendStatus(500);
        
      }
      else
      {
          res.sendStatus(200);
      }
    });
  });
//Post method for when a user creates an Event
app.post('/create', (req, res) => {
  var title = req.body.newevent.EventTitle;
  var image = req.body.newevent.EventImage;
  var userName = req.body.newevent.UserName;
  var latitude = req.body.newevent.EventLatitude;
  var longitude = req.body.newevent.EventLongitude;
  var startDate = req.body.newevent.EventStartDate;
  var endDate = req.body.newevent.EventEndDate;
  var location = req.body.newevent.EventLocation;
  var category = req.body.newevent.EventCategory;
  var vibe = req.body.newevent.EventVibe;
  connection.query('Insert into Events(Title, Image, Location, Vibe, EventLatitude, EventLongitude, StartDate, EndDate, Category, HostUserID) values(?,?,?,?,?,?,date(?),date(?),?, (select userID from Users where userName = ?))', [title, image, location, vibe, latitude, longitude, startDate, endDate, category, userName], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result.insertId));
    }
  });
});
//Post request for when an event adds a keyword to their event
app.post('/event/keywords', (req, res) => {
    var eventID = req.body.keyword.eventid;
    var keyword = req.body.keyword.keyword;
    connection.query('INSERT into Keywords(EventID, keyword) Values(?, ?)', [eventID, keyword], function(error, result, fields){
      if(error)
      {
          if(error.errno == 1062)
          {
              res.sendStatus(204);
          }
          else
          {
              res.sendStatus(500);
          }
        
      }
      else {
        res.sendStatus(200);
      }
    });
  });
//Put request to check if a user is currently in our system with the password they gave, will send a 200 
//if the password matches the username otherwise sends a 204 if the username or password is incorect
app.put('/login', (request, response, next) => {
  var userName = request.body.user.username;
  var pwd = request.body.user.password;
  connection.query('SELECT * from Users where userName = ?', [userName], function(error, result, fields) {
      if(error){
        response.sendStatus(500);
      }
      else {
        if(result.length != 0)
        {
          if(bcrypt.compareSync(pwd, result[0].Password))
          {
            response.sendStatus(200);
          }
          else
          {
            response.sendStatus(204);
          }
        }
        else {
          response.sendStatus(204);
        }
      }
  });
});
//Updates the rating in the database for a given vibe
app.put('/newrating', (req, res) => {
    var eventID = req.body.rating.eventid;
    var newRating = req.body.rating.newrate;
    connection.query('update Events set Vibe = ? where EventID = ?', [newRating, eventID], function(error, result, field){
        if(error)
        {
            res.sendStatus(500);
        }
        else
        {
            res.sendStatus(200);
        }
    });
});
//Deletes an Event from the Event page for the given id, that's been given by the client
app.put('/deleteEvent', (req, res) =>{
  var id = req.body.eve.id;
  // res.send(JSON.stringify(id));
  connection.query('delete from Events where EventID = ?', [id], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
//Post method to start a new request between a user and someone else
app.post('/messagecontacts/add', (req, res) =>{
  var userName = req.body.messageContact.userName;
  var recieverUser = req.body.messageContact.recieverUserName;
  connection.query('insert into Contacts(ProfileUserID, FriendUserID) values((select userID from Users where userName = ?), (select userID from Users where userName = ?))', [userName, recieverUser], function(error, result, field){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  })
});
//Get method for grabbing the profile information based on the username in the url
app.get('/profile/:username', (req, res)=>{
  var username = req.params.username;
  connection.query('select userID as id, userName, ProfilePicture as profilePicture from Users where userName = ?', [username], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result[0]))
    }
  });
});
//Added a get method to get all contacts that a given user has"
app.get("/contacts/:userName", (req, res) => {
  var userName = req.params.userName;
  connection.query('select FriendUserID as id, userName as UserName, ProfilePicture from Contacts join Users on (Users.userID = Contacts.FriendUserID) where ProfileUserID = (select userID from Users where userName = ?)', [userName], function(error, result, field){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result));
    }
  });
});

//Put request to delete a contact between a user and a reciepient
app.put('/messagescontacts/delete', (req, res)=>{
  var username = req.body.contactDelete.username;
  var recipientname = req.body.contactDelete.recipientname;
  connection.query('delete from Contacts where ProfileUserID = (select userID from Users where userName = ?) and FriendUserID = (select userID from Users where userName = ?)', [username, recipientname], function(error, result, field){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  })
});
app.put('/updateevent', (req, res) => {
  var id = req.body.eve.id;
  var title = req.body.eve.title;
  var date = req.body.eve.date;
  var location = req.body.eve.location;
  var category = req.body.eve.category;
  var vibe = req.body.eve.vibe;
  connection.query('update Events set Title = ?, Location = ?, Vibe = ?, StartDate = date(?), Category = ? where EventID = ?', [title, location, vibe, date, category, id], function(error, result, fields){
    if(error)
    {
      console.log(error);
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
//Put method to delete all messages between a user and another user
app.put('/deletemessagecontacts', (req, res)=>{
  var userName = req.body.contactDelete.userName;
  var contactName = req.body.contactDelete.contactName;
  connection.query('delete from Messages where SenderUserID = (select userID from Users where userID = ?) and RecieverUserID = (select userID from Users where userID = ?)', [userName, contactName], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
app.put("/messagecontacts/delete", (req, res)=>{
  var username = req.body.user.username;
  var contact = req.body.user.contact;
  connection.query('delete from Messages where SenderUserID = (select userID from Users where userName = ?) and RecieverUserID = (select userID from Users where userName = ?)', [username,contact], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
//Put method to update the privacy of a profile
app.put('/setPrivacy', (req,res)=>{
  var username = req.body.privacy.username;
  var privacy = req.body.privacy.privacy;
  connection.query('update Users set Privacy = ? where userName = ?', [privacy, username], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
//Post method to add a new entry to the Collect Rating Star table
app.post('/addcollectratingtable', (req, res)=>{
  var username = req.body.collectrating.username;
  var eventID = req.body.collectrating.eventid;
  var timestamp = req.body.collectrating.timestamp;
  connection.query('insert into CollectRatings(userID, eventID, timeStamp) values((select userID from Users where userName = ?),?,?)'[username, eventID, timestamp], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
//get method to get all the contacts with messages for a given user given through the url
app.get('/messagecontacts/:userName', (req, res) => {
    var userName = req.params.userName;
    connection.query('select distinct Users.userName from Users join Messages on (Users.userID = Messages.RecieverUserID) where Messages.SenderUserID = (select userID from Users where userName = ?)', [userName], function(error, result, fields){
        if(error){
            console.log(error);
            res.sendStatus(500);
          }
        else
        {
            res.send(JSON.stringify(result));
        }
    });
});
//Get method to check for the event currently happening now
app.get('/currentevent/:username/:datetime/:latitude/:longitude', (req, res) =>{
  var username = req.params.username;
  var datetime = req.params.datetime;
  var latitude = req.params.latitude;
  var longitude = req.params.longitude;
  connection.query('select EventID as ID, Title as EventTitle from Users join (select * from Events natural join Invites) as a on (a.RecipientUserID = Users.userID)  where a.EventLatitude - ? <= 0.00001 and a.EventLatitude - ? >= -0.00001 and a.EventLongitude - ? <= 0.00001 and a.EventLongitude - ? >= -0.00001 and Users.userName = ? and Status = \'Attending\' and a.StartDate = ? limit 1', [latitude, latitude, longitude, longitude,username, datetime], function(error, result, fields){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.send(JSON.stringify(result));
    }
  });
});
//Put method to check the current event with a given username and event start time given to the server
app.put('/currentevent', (req, res) => {
    var userName = req.body.currentevent.username;
    var checkDate = req.body.currentevent.thedate;
    connection.query('select invites.EventID from (select Invites.EventID from Invites join Users on (Invites.RecipientUserID = Users.userID) where Users.username = ?) as invites join Events on (invites.EventID = Events.EventID) where Events.StartDate = ?',[userName, checkDate], function(error, result, fields){
        if(error){
            res.sendStatus(500);
          }
          else {
            if(result.length != 0)
            {
                res.sendStatus(200);
            }
            else {
              res.sendStatus(204);
            }
          }
    });
});
//Post method to invite a user to an event
app.post('/invite', (req, res)=>{
  var senderUserName = req.body.invite.senderUserName;
  var reciepientUserName = req.body.invite.reciepientUserName;
  var eventID = req.body.invite.eventID;
  connection.query('insert into Invites(SenderUserID, RecipientUserID, EventID) values((select userID from Users where userName = ?), (select userID from Users where userName = ?), ?)', [senderUserName, reciepientUserName, eventID],function(error, result, field){
    if(error)
    {
      res.sendStatus(500);
    }
    else
    {
      res.sendStatus(200);
    }
  });
});
//Gets all messages between the senderName and the recieverName
app.get('/messages/:senderName/:recieverName', (req, res) => {
    var senderName = req.params.senderName;
    var recieverName = req.params.recieverName;
    connection.query('select senderUserName.SenderName as SenderUserName, Users.userName as ReceiverUserName, senderUserName.Message as MessageContent' 
    + ' from (select Users.userName as SenderName, Messages.RecieverUserID, Messages.Message, Messages.MessagesID' 
    +' from Users join Messages' 
    +' on (Users.userID = Messages.SenderUserID)'
    +' where Users.userName = ? or Users.userName = ?) as senderUserName join Users' 
    + ' on (senderUserName.RecieverUserID = Users.userID)'
    +' where Users.userName = ? or Users.userName = ? order by senderUserName.MessagesID', [senderName, recieverName, recieverName, senderName], function(error, result, fields){
        if(error){
            res.sendStatus(500);
          }
        else
        {
            res.send(JSON.stringify(result));
        }
    });
});

// app.get('/user', (request, response, next) => {
//   connection.query('SELECT * from Users', function(error, result, fields){
//     if(error)
//     {
//       response.sendStatus(500);
//     }
//     else {
//       response.send(JSON.stringify(result));
//     }
//   });
// });
// app.get('/user', (request, response, next) => {
//   connection.query('SELECT FirstName, LastName from test', function (error, results, fields) {
// 	  	if(error){
// 	  		response.send(JSON.stringify({"status": 500, "error": error, "response": null}));
// 	  		//If there is error, we send the error in the error section with 500 status
// 	  	} else {
//   			response.send(JSON.stringify(results));
//   			//If there is no error, all is good and response is 200OK.
// 	  	}
//   	});
// });

const saveArrayAsFile =  (arrayBuffer, filePath)=> {
  fs.writeFile(filePath, Buffer.from(arrayBuffer), 'binary',  (err)=> {
      if (err) {
          console.log("There was an error writing the image")
      }
      else {
          console.log("Written File :" + filePath)
      }
  });
};

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server started on port " + port);
});