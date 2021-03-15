module.exports = {
    getNotifications : (req, res)=>{
        var username = req.params.username;
        connection.query('select distinct senders.Sender, senders.EventID as EventId, Events.Title as EventTitle from Events join (select sender.userName as Sender, sender.EventID, sender.Status, Users.userName from Users join (select * from Users join Invites on (Invites.SenderUserID = Users.userID)) as sender on (Users.userID = sender.RecipientUserID)) as senders on (Events.EventID = senders.EventID) where senders.Status = \'Recieved\' and senders.userName = ?', [username], function(error, result, field){
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
    acceptNotification : (req, res)=>{
        var recipient = req.body.notif.Recipient;
        var sender = req.body.notif.Sender;
        var eventID = req.body.notif.EventId;
        connection.query('update Invites set Status = \'Accept\' where EventID = ? and RecipientUserID = (select userID from Users where userName = ?) and SenderUserID = (select userID from Users where userName = ?)', [eventID, recipient, sender], function(error, result, field){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            res.sendStatus(200);
          }
        })
      },
    declineNotification : (req, res)=>{
        var recipient = req.body.notif.Recipient;
        var sender = req.body.notif.Sender;
        var eventID = req.body.notif.EventId;
        connection.query('update Invites set Status = \'Deny\' where EventID = ? and RecipientUserID = (select userID from Users where userName = ?) and SenderUserID = (select userID from Users where userName = ?)', [eventID, recipient, sender], function(error, result, field){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            res.sendStatus(200);
          }
        })
      },
    inviteToEvent : (req, res)=>{
        var senderUserName = req.body.invite.senderUserName;
        var reciepientUserName = req.body.invite.reciepientUserName;
        var eventID = req.body.invite.eventID;
        connection.query('insert into Invites(SenderUserID, RecipientUserID, EventID, Status) values((select userID from Users where userName = ?), (select userID from Users where userName = ?), ?, \'Recieved\')', [senderUserName, reciepientUserName, eventID],function(error, result, field){
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