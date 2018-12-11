const express = require('express');
const router = express.Router();

var mysql      = require('mysql');
var con = mysql.createConnection({
    host     : 'iot.abbindustrigymnasium.se',
    user     : 'ljuside2',
    password : 'lokförarkatt',
    database : 'ljuside2'
}); 
con.connect(function(err){
    if (err) 
    throw err;
});

    var Values_FromDB;  
    var cron = require('node-cron');

    cron.schedule('*/10 * * * * *', () => {
  
    var GetLight = function(){
      return new Promise(function(resolve,reject){

          con.query('SELECT * FROM light ', function (error, results) {
              if (error) 
              return reject (error);
              else
              return resolve(results)
              
            });
      });
  }
    GetLight().then( result => {
      Values_FromDB= result; 
      console.log("...")
  
    
  
    
    });
});




  
 
    router.get('/', (req, res) => {
        res.status(200).json({
            messege: 'Getter', 
            result: Values_FromDB
        });
    });


  
  router.get('/:lightName', (req, res) => {
    var found=false;
    var Outputvalue;
    Values_FromDB.forEach(element => {
      if(element.lightName== req.params.lightName){
        found=true; 
        Outputvalue=element; 
      }
    });
    if (found!=true){
      res.status(200).json({lightName:"none", 
      message: "No such lamp exists"
    });
    }
    else 
  {
    res.status(200).json(Outputvalue);
    console.log(Outputvalue);
  }
});

router.post('/', (req, res, next) => {
    const light = {
        lightName: req.body.lightName,
        Str: req.body.Str
    };

    var Createdlight= function(){
        return new Promise(function(resolve,reject){

            var Thelight= [light.lightName,light.Str];
            console.log(Thelight);
            con.query('INSERT INTO light (lightName, Str) VALUES ?',[[Thelight]], function (error, results) {
                if (error)
                return reject (error);
                else
                return resolve(Thelight)
              });
        })
    }

    Createdlight().then( Thelight => {

        res.status(201).json({
            message:"Success, new value!",
            light: Thelight
        })
    }   ).catch(error => {
        res.status(500).json({
            error: error
        })
    });
    
    });

    router.patch('/', (req, res) => {
        const lightName = {
            lightName: req.body.lightName,
            Str: req.body.Str
        }
    
        var updateValue = function(){
            return new Promise(function(resolve, reject){
                con.query('UPDATE `light` SET `Str` = ? WHERE `lightName` = ?',[lightName.Str, lightName.lightName], function (error, results) {
                    if (error)
                    return reject(error);
                    else
                    return resolve(results)
                });
            })
        }
        updateValue().then(result => {
            if (result.affectedRows > 0)
                res.status(200).json(result);   
            else
                res.status(404).json({
                message: "Not found"
            });
    
    } ).catch(error => {
            res.status(500).json({
               error: error
          })
        });
    });

    router.delete('/', (req, res, next) => {
   
        console.log(req.params.lightName);
        var deleteRows = function(){
            return new Promise(function(resolve, reject){
                const lightName = req.params.lightName;
                con.query('DELETE FROM light WHERE lightName = ?',[lightName], function (error, results) {
                    console.log(error);
                    if (error)
                    return reject(error);
                    else
                    return resolve(results)
                });
            })
        }
        deleteRows().then(result => {
    
            if (result.length == 0) {
                res.status(404).json({
                    message: "Lights off"
               });
           }
           else
           res.status(200).json(result)
    
    } ).catch(error => {
            res.status(500).json({
               error: error
          })
        });
    });
    module.exports = router;
