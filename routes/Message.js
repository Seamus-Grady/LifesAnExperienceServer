module.exports = {
    addAMessage : (req, res) => {
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
      },
    AddMessageContact : (req, res) =>{
        var userName = req.body.addcontact.username;
        var recieverUser = req.body.addcontact.contact;
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
      },
    getAllContacts : (req, res) => {
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
      },
    deleteAContact : (req, res)=>{
        var username = req.body.user.username;
        var recipientname = req.body.user.contact;
        connection.query('delete from Contacts where ProfileUserID = (select userID from Users where userName = ?) and FriendUserID = (select userID from Users where userName = ?)', [username, recipientname], function(error, result, field){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            connection.query('delete from Messages where SenderUserID = (select userID from Users where userID = ?) and RecieverUserID = (select userID from Users where userID = ?)', [username, recipientname], function(error, result, fields){
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
        })
      },
    deleteAllMessagesForAContact : (req, res)=>{
        var userName = req.body.user.username;
        var contactName = req.body.user.contact;
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
      },
    getAllMessageForAContact : (req, res) => {
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
    },
    getAllMessagesBetweenTwoUsers : (req, res) => {
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
    }
};