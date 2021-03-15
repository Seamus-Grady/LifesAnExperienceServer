module.exports = {
    addARatingForTable : (req, res)=>{
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
      } 
};