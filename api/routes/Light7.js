const express = require("express");
const router = express();
var mysql = require("mysql");
var con = mysql.createConnection({
    host: "iot.abbindustrigymnasium.se",  //host 
    user: "ljuside7",  // användarnamn till databasen
    password: "sigtunabo",  //lösenord 
    database: "ljuside7"   // databasens namn
});

con.connect(function (err) {
    if (err) throw err;
});

router.get("/", (req, res)=> { // hämtar alla värden från databasen
        res.status(200).json({
            message: "light:",
            result: Values_fromDB});
});

var Values_fromDB;
var cron = require('node-cron'); //cron är ett sätt att köra en viss kod i olika intervaller
 
cron.schedule('* * * * * *', () => { //vi har valt att cron ska köra koden varje sekund som man ser på de sex asterixerna

   var getLight = function(){ //en funktion som hämtar all data från tabellen vi har valt i databasen

          return new Promise(function(resolve,reject){
             con.query('SELECT * FROM light' , function (error, results, fields) { //sql-koden som hämtar alla (*) värden i tabellen
                 if (error)
                 return reject (error);
                 else
                 return resolve(results);
 
             });
         
         });
        }    


getLight().then(response =>{ //kör funktionen
    Values_fromDB= response; // lägger in resultatet i en variabel som ligger lokalt(Values_fromDB).
})
}, null, true, "America/Los-angeles"); //anger tidszonen som cron ska gå efter


router.get("/:Name", (req, res)=> { 
    console.log(req.params.Name);
    var found=false;
    var outputValue;
    Values_fromDB.forEach(element => {
        console.log(element.Name);
        if (element.Name== req.params.id){
            found=true;
            outputValue = element;
        }
    });
    if (found != true) { 
        res.status(404).json({
    message: "no lamp found"});
    }
else 
{
    res.status(200).json(outputValue);
    console.log(outputvalue);
}
}); 

router.post("/:id", (req, res)=> {
    const Lamp = {
        id: req.params.id, //tar värdet du har angett till namn i json och gör om den till en variabel.
        temp: req.body.temp, 
        ljus: req.body.ljus
    };

    var createdLamp = function(){ 
       return new Promise(function(resolve,reject){

            var theLamp = [Lamp.id,Lamp.temp,Lamp.ljus];

            console.log(theLamp);

            con.query('INSERT INTO light (id,temp,ljus) VALUES ?', [[theLamp]], function (error, results, fields) {
                if (error)
                return reject (error);
                else
                return resolve(theLamp);

            });
        
        });
    }

    createdLamp().then( theLamp => {

        res.status(201).json({ 
            message: "Lamp Created!",
            Lamp: theLamp
        })
    } ).catch(error => {
        res.status(500).json({
            error: error
        })
    })
    
});

router.patch('/:id', (req, res, next) => {

    const product = {
        id: req.params.id,
        temp: req.body.temp,
        ljus: req.body.ljus
    };

    var adjustLight = function(){
        return new Promise(function(resolve,reject){
 
             console.log(product.Name);
 
             con.query('UPDATE `light` SET `temp` = ?, `ljus` = ? WHERE `id` = ?', [product.temp, product.ljus, product.id], function (error, results) {
                 console.log(error);
                 if (error)
                 return reject (error);
                 else
                 return resolve(results);
             });
         
         })
     }
 
     adjustLight().then( result => {
        console.log(result);
               
        if(result.affectedRows>0) {
            
            res.status(200).json({
                message: "Lamp adjusted",
                result
            });
            }
            else
                res.status(200).json({
                    message : "nothing changed"
            });
   

   } ).catch(error => {
         res.status(500).json({
             error: error
         })
        });
    });

module.exports = router;
