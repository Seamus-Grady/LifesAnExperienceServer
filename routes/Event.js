module.exports = {
    getAnEvent : (req, res) =>{
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
      },
      getAllEventsForAUser : (req, res)=>{
        var userName = req.params.userName;
        connection.query('select b.ID, b.EventTitle, b.EventImage, b.EventLocation, b.EventLatitude, b.EventLongitude, b.EventVibe, b.EventStartDate, b.EventEndDate, b.EventCategory, b.UserName, CollectRatings.userID from (select EventID as ID, Title as EventTitle, Image as EventImage, Location as EventLocation, EventLatitude, EventLongitude, Vibe as EventVibe, StartDate as EventStartDate, EndDate as EventEndDate, Category as EventCategory, Users.userName as UserName from Events join Users on (Users.userID = Events.HostUserID))as b left join CollectRatings on (CollectRatings.eventID = b.ID) where b.userName = ?', [userName], function(error, result, field){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            res.send(JSON.stringify(result));
          }
        })
      },
    getCurrentHappenings : (req, res) => {
      var userName = req.params.userName;
        connection.query('select d.ID, d.EventTitle, d.EventImage, d.EventLocation, d.EventLatitude, d.EventLongitude, d.EventVibe, d.EventStartDate, d.EventEndDate, d.EventCategory, d.EventKeywords, d.UserName, b.userID as UserRating from (select a.EventID as ID, a.Title as EventTitle, a.Image as EventImage, a.Location as EventLocation, a.EventLatitude, a.EventLongitude, a.Vibe as EventVibe, a.StartDate as EventStartDate, a.EndDate as EventEndDate, a.Category as EventCategory, a.EventKeywords, Users.userName as UserName from (select Events.EventID, Title, Image, Location, EventLatitude, EventLongitude, Vibe, StartDate, EndDate, Category, HostUserID, group_concat(keyword) as EventKeywords from Keywords join Events on (Keywords.EventID = Events.EventID) group by EventID) as a join Users on (userID = a.HostUserID)) as d left join (select * from CollectRatings  where CollectRatings.userID = (select userID from Users where userName = ?)) as b on (d.ID = b.eventID) limit 4', [userName], function(error, result, fields){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            res.send(JSON.stringify(result));
          }
        });
      },
    createEvent: (req, res) => {
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
        var filePath = '';
        if(image != null)
        {
          var pictureCount = fs.readdirSync('/home/ubuntu/LifesAnExperienceServer/Images').length + 1;
          filePath = 'img_' + pictureCount + '.jpg';
          saveArrayAsFile(image, '/Images/' + filePath);
          filePath = 'http://100.26.223.139:3000/img/' + filePath;
        }
        connection.query('Insert into Events(Title, Image, Location, Vibe, EventLatitude, EventLongitude, StartDate, EndDate, Category, HostUserID) values(?,?,?,?,?,?,date(?),date(?),?, (select userID from Users where userName = ?))', [title, filePath, location, vibe, latitude, longitude, startDate, endDate, category, userName], function(error, result, fields){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            res.send(JSON.stringify({Id: result.insertId, EventImage: filePath}));
          }
        });
      },
    addKeywordForAnEvent : (req, res) => {
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
      },
    deleteAnEvent : (req, res) =>{
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
      },
    updateEvent: (req, res) => {
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
      },
    addARating : (req, res) => {
        var eventID = req.body.rating.eventid;
        var newRating = req.body.rating.newrate;
        var userName = req.body.rating.userName;
        var timestamp = req.body.rating.timestamp;
        connection.query('update Events set Vibe = ? where EventID = ?', [newRating, eventID], function(error, result, field){
            if(error)
            {
              
              {
                console.log(error);
                res.sendStatus(500);
              }  
            }
            else
            {
              connection.query('insert into CollectRatings(userID, eventID, timeStamp) values((select userID from Users where userName = ?), ?, ?)', [userName, eventID, timestamp], function(error, result, field){
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
                else
                {
                  res.sendStatus(200);
                }
              }
              ); 
            }
        });
        },
    checkEventHappeningNow : (req, res) =>{
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
      },
    getAllAttendeesForAnEvent : (req, res) =>{
      var eventID = req.params.eventID;
      connection.query('select distinct Users.userName as UserName, Users.ProfilePicture from Invites join Users where Invites.EventID = ?', [eventID], function(error, result, field){
        if(error)
        {
          res.sendStatus(500);
        }
        else
        {
          res.send(JSON.stringify(result));
        }
      });
      },
    joinAnEvent : (req, res) =>{
      var eventID = req.body.eve.id;
      var userName = req.body.eve.username;
      connection.query('insert into Invites(SenderUserID, RecipientUserID, EventID, Status) values((select userID from Users where userName = ?), (select userID from Users where userName = ?), ?, \'Accept\')', [userName, userName, eventID], function(error, result, field){
        if(error)
        {
          res.sendStatus(500);
        }
        else
        {
          res.sendStatus(200);
        }
      });
    }  
};
const saveArrayAsFile =  (arrayBuffer, filePath)=> {
  console.log(filePath);
  fs.writeFile('/home/ubuntu/LifesAnExperienceServer/'+ filePath, Buffer.from(arrayBuffer, 'base64'), 'binary',  (err)=> {
      if (err) {
          console.log("There was an error writing the image")
      }
      else {
          console.log("Written File :" + filePath)
      }
  });
};