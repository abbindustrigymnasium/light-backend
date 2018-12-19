const express = require('express');
const router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'iot.abbindustrigymnasium.se',
  user     : 'ljuside6',
  password : 'renbullar',
  database : 'ljuside6'
});
// Vi skapar en variabel som inehåller allt som behövs för att ansluta till våra databas
 
connection.connect( function(err) {
    if (err) {
        throw err;
    } else
    console.log("Sassa Massa");
});
// Vi testar om vi kan koppla upp. Om det går kommer den skriva ut Sassa Massa

var Values_fromDB;
var cron = require('node-cron');
cron.schedule('* * * * * *', () => {

    //Vi använder node-cron för att ständigt hålla våras värden uppdaterade.
    //6 stjärnor innebär att den utför arbetet varje sekund

    var GetLight = function () {
        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM lamapen", function (err,result) { 
                if (err) {
                    return reject(err);
                } else {
                    return resolve(result);
                }
            });
        });
    }
    GetLight().then(response => {
        Values_fromDB= response;
        //console.log(Values_fromDB);
        //Vi skapar variabeln GetLight och gör den till en funktion som hämtar värden från databasen
    })
}, null, true, 'America/Los_Angeles');


router.get('', (req, res) => {
    res.status(200).json(Values_fromDB);
        console.log(Values_fromDB);
    });

router.get('/:lampName', (req, res) => {
    //Detta är get funktionen som används av lampan. Om avsändaren har med ett "lampName" så kommer denna get att köras
    //Dess syfte är att hämta ut värden för en specifik Lampa i databasen
    var found=false;
    var OutputValue;
    Values_fromDB.forEach(element => {
        if (element.LampName== req.params.lampName) {
            found=true;
            OutputValue =element;
            //Om lampName stämmer överens med ett namn i databasen så går den vidare och skicka värden, om inte får man ett felmeddelande
        }
    });
    if (found!= true) {
        res.status(200).json({name: "none",
    message: "ne de finns inga lampor"});
    }
    else
    {
        res.status(200).json(OutputValue);
        console.log(OutputValue);
    }
});


router.patch('/:LampName', (req, res, next) => {
    //Patch används för att ändra värden i databasen, vilket vi använder för att ändra ljusstyrkan

    const Lamp = {
        Name: req.body.Name,
        Warm: req.body.Warm,
        Cold: req.body.Cold,
        LED: req.body.LED
    }
    //vi skapar variabeln lamp som innehåller alla värden som skickats i bodyn till databasen.

    var updateproduct= function(){
        return new Promise(function(resolve,reject){

            connection.query('UPDATE `lamapen` SET `LampStrengthWarm`= ?, `LampStrengthCold`= ?, `LEDSwitch`= ? WHERE `LampName` = ?',[Lamp.Warm, Lamp.Cold, Lamp.LED, Lamp.Name], function (error, results, fields) {
                if (error)
                return reject(error);
                else
                return resolve(results)  
              });
        });
    } 
    //updateproduct använder sig av variabeln Lamp och SQL-kod för att hämta värden från databasen.

    updateproduct().then( result => {
        //kom ihåg att det är först här som funktionen körs. Innan detta skapade vi bara funktionen, men vi körde den inte.

       if (result.affectedRows>=1) {
            res.status(200).json(result);
            
        }
        else
        res.status(200).json({
            message: "No such lamaps to update"
        } );
    }).catch(error => {
            res.status(500).json({
                error: error
            });
        });
});


router.post('', (req, res, next) => {

    const Lamp = {
        Name: req.body.Name,
        Warm: req.body.Warm,
        Cold: req.body.Cold,
        LED: req.body.LED
    }

    var CreatedLamp= function(){
        return new Promise(function(resolve,reject){

            var LampValues = [Lamp.Name, Lamp.Warm, Lamp.Cold, Lamp.LED]

            connection.query('INSERT INTO `lamapen` (`LampName`, `LampStrengthWarm`, `LampStrengthCold`, `LEDSwitch`) VALUES ?',[[LampValues]], function (error, results, fields) {
                if (error)
                return reject(error);
                else
                return resolve(results)  
              });
        });
    } 

CreatedLamp().then( NewLamp => {
    res.status(201).json({
        message:"Success, new lamap",
        result: NewLamp
    })
} ).catch(error => {
    res.status(500).json({
        error: error
    })
});
});
//Post är densamma som patch men istället för att ändra värden så lägger vi in nya värden.


router.delete('/:LampName', (req, res, next) => {

    var DeleteLamp= function(){
        return new Promise(function(resolve,reject){

            connection.query('DELETE FROM lamapen WHERE `LampName` = ?',[req.params.LampName], function (error, results, fields) {
                if (error)
                return reject(error);
                else
                return resolve(results)  
              });
        });
    } 
    //Vi använder oss av lampName som skickas med för att ta bort värden från databasen

    DeleteLamp().then( result => {

       if (result.affectedRows>=1) {
            res.status(200).json(result);
            
        }
        else
        res.status(200).json({
            message: "You better not delete the slayer lamp,"
        } );
    }).catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

module.exports = router;
