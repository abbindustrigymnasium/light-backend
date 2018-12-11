const express = require('express');
const router = express();
var mysql = require("mysql");
var con = mysql.createConnection({
    host: "iot.abbindustrigymnasium.se",
    user: "ljuside8",
    password:"tavelpenna",
    database: "ljuside8"
});

var Values_fromDB;
var cron = require('node-cron');
 
cron.schedule('* * * * * *', () => {

    var GetLight = function() {
        return new Promise(function (resolve, reject) {
            con.query("SELECT * FROM lightstatus", function (err, result) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(result);
                }
            });
        });
    }
    GetLight().then(response =>{
        Values_fromDB = response;

     console.log(Values_fromDB);
    })

});

con.connect(function (err){
    if (err) throw err;
});

router.get('', (req, res) => {
  res.status(200).json(Values_fromDB[0]);
  console.log(Values_fromDB[0]);
 
});

router.get('/:lampName', (req, res) => {
    console.log(req.params.lampName);
    var found = false;  //en variabel som heter found och är falsk
    var Outputvalue;    //en tom variabel
    Values_fromDB.forEach(element => { //alla värden, en efter en, blir kallade element
        if (element.name == req.params.lampName) { //om elementets namn är samma som req.params.lampName så blir variabeln found sann
            found = true; 
            Outputvalue = element; // och Outputvalue blir element

        }
    });
    if (found!= true) {     //om found inte är sann så skriver programmet ut "no such lamp exists"
        res.status(200).json({name: "none",
    message: "No such lamp exists"});
    }
    else        //annars skriver den ut outputvalue
    {
        res.status(200).json(Outputvalue);
        console.log(Outputvalue);
    }

});


router.post('/', (req, res, next) => {
    const light = {
        onoff: req.body.onoff,
        lighttemperature: req.body.lighttemperature,
        lightstrength: req.body.lightstrength,
        name: req.body.name,
    }

    var createdLight = function(){
        return new Promise(function(resolve, reject){

            var Lights= [light.onoff, light.lighttemperature, light.lightstrength, light.name];
            console.log(Lights);

            con.query('INSERT INTO lightstatus (onoff, lighttemperature, lightstrength, name) VALUES ?',[[Lights]], function (error, results, fields) {
                if (error) 
                return reject (error);
                else
                return resolve(Lights)

                res.status(200).json({
                    message: 'Getter',
                    result: results});
            });
        
        } )

    }

    createdLight().then(Lights => {
        res.status(201).json({
            message:"new lightstatus",
            Light: Lights
        })
    }).catch(error => {
        res.status(500).json({
            error: error
        })
    });

});

router.patch('/:lampName', (req, res, next) => {

    const light = {
        onoff: req.body.onoff,
        lighttemperature: req.body.lighttemperature,
        lightstrength: req.body.lightstrength,
    }

    var updateLight = function(){
        return new Promise(function(resolve, reject){

            con.query('UPDATE `lightstatus` SET `onoff`= ?, `lighttemperature` = ?, `lightstrength` = ? WHERE `name` = ?',[light.onoff,light.lighttemperature,light.lightstrength, req.params.lampName], function (error, results) {
                if (error) 
                return reject (error);
                else
                return resolve(results)
            });
        
        } )

    }

    updateLight().then(result => {

   if (result.affectedRows!=0) {
        
        res.status(200).json(result);
    
    }
    
    else
    res.status(404).json({
        message: "Update imposible, lack of values"
        });

    }   ).catch(error => {
        res.status(500).json({
            error: error
        })
    });
});

router.post('/google_home/:lampName', (req, res, next) => {
    const light = {
        onoff: req.body.onoff,
    }

    var updateLight = function(){
        return new Promise(function(resolve, reject){

            con.query('UPDATE `lightstatus` SET `onoff`= ? WHERE `name` = ?',[light.onoff, req.body.lampName], function (error, results) {
                if (error) 
                return reject (error);
                else
                return resolve(results)
            });
        
        } )

    }

    updateLight().then(result => {

   if (result.affectedRows!=0) {
        
        res.status(200).json(result);
    
    }
    
    else
    res.status(404).json({
        message: "Update imposible, lack of values"
        });

    }   ).catch(error => {
        res.status(500).json({
            error: error
        })
    });
});


module.exports = router;
