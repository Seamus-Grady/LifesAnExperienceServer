const bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var fs = require("fs");

module.exports = {
    updateProfilePicture: (req, res)=>{
        var userName = req.body.user.username;
        var profilePicture = req.body.user.profilepicture;
        console.log(profilePicture);
        console.log(userName);
        var pictureCount = fs.readdirSync('/home/ubuntu/LifesAnExperienceServer/Images').length
        var filePath = 'img_' + pictureCount + '.jpg';
        saveArrayAsFile(profilePicture, '/Images/' + filePath);
        filePath = 'http://100.26.223.139:3000/img/' + filePath;
        connection.query('update Users set ProfilePicture = ? where userName = ?', [filePath, userName], function(error, result, field){
          if(error)
          {
            res.sendStatus(500);
          }
          else
          {
            res.send(JSON.stringify(filePath));
            pictureCount++;
          }
        })},
    registerAProfile: (req, res) => {
        var hash = bcrypt.hashSync(req.body.user.password, salt);
        var userEmail = req.body.user.email;
        var userName = req.body.user.username;
        var profilePicture = req.body.user.profilepicture;
        connection.query('INSERT into Users(userEmail, Password, userName, ProfilePicture) Values(?, ?, ?, ?)', [userEmail, hash, userName, profilePicture], function(error, result, fields){
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
        })},
    loginAProfile : (req, res) => {
            var userName = req.body.user.username;
            var pwd = req.body.user.password;
            connection.query('SELECT * from Users where userName = ?', [userName], function(error, result, fields) {
                if(error){
                  res.sendStatus(500);
                }
                else {
                  if(result.length != 0)
                  {
                    if(bcrypt.compareSync(pwd, result[0].Password))
                    {
                      res.sendStatus(200);
                    }
                    else
                    {
                      res.sendStatus(204);
                    }
                  }
                  else {
                    res.sendStatus(204);
                  }
                }
            });
          },
    getProfileInformation : (req, res)=>{
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
      },
    setPrivacyOfProfile : (req,res)=>{
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