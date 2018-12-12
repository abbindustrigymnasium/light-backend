const express = require('express');
const router = express();
var mysql = require("mysql");
var con = mysql.createConnection({
    host: "iot.abbindustrigymnasium.se",
    user: "ljuside5",
    password: "skyddslinglåda",
    database: "ljuside5"
});

var cron = require('node-cron');

var getDB; // variabel som används med get by name


var getLight = cron.schedule('* * * * * *',  () => { // ska köras en gång per sekund
    con.query('SELECT * FROM appbelysning', function (error, response) { 
    if (error) throw error;
    getDB = response; 
     
        
    })
,  { scheduled: false
   };

});

getLight.start() // startar funktionen

router.get('/:appbelysningName', (req, res) => { //ger för enskilt id
    var found=false;
    var lampNameValue;

    getDB.forEach(element => {
        if (element.name== req.params.appbelysningName) {
            found=true; // ändrar found till true om lampan finns
            lampNameValue = element; // ger variabeln värdena för visst id
        }
    
    });
        if(found!= true) {
            res.status(200).json({name: "Lampan finns ej.",
        message: "Testa att skicka med post istället och kolla stavfel!"}) // felmeddelande
        }

        else
        {
            res.status(200).json(lampNameValue); // skickar status och resultatet

        }
});

router.post('/', (req, res, next) => {
    
    const ljuside= {
         name: req.body.name,
         påav: req.body.påav,
         varm: req.body.varm,
         kall: req.body.kall,
         ljusstryrka: req.body.ljusstryrka
        };
    
        var Createdlamp = function(){
            return new Promise(function(resolve,reject){
    
                var lamp = [ljuside.name, ljuside.påav, ljuside.varm, ljuside.kall, ljuside.ljusstryrka];
                console.log(lamp);
                con.query('INSERT INTO appbelysning (name, påav, varm, kall, ljusstryrka) VALUES ?',[[lamp]], function (err, results) {
                    console.log(results);
                    if (err) 
                    return reject (err);
                    else 
                    return resolve(lamp)
    
                    
                  });
            })
    
    
        }
        Createdlamp().then(lamp => { 

            res.status(200).json({
                message:'Sucess, new product',
                lamp: lamp // ger resultatet
        });
    }).catch(error => {
        res.status(500).json({
            error: error // ger felmeddelande
        });
    });     
});   

router.patch('/:appbelysningName', (req, res) => {

    const lampa = {
        name: req.params.appbelysningName,
        påav: req.body.påav,
        varm: req.body.varm,
        kall: req.body.kall,
        ljusstryrka: req.body.ljusstryrka,
    }
const data = [lampa.påav, lampa.varm, lampa.kall, lampa.ljusstryrka, lampa.name];

    var updatelampa = function() {
        return new Promise(function(resolve, reject) {
            
            con.query('UPDATE `appbelysning` SET `påav`= ?,`varm`= ?,`kall`= ?,`ljusstryrka`= ? WHERE `name` = ?', data, function (error, result) {
                if (error)
                return reject(error);
                else
                return resolve(result);
            });        
        });
    }
   

    updatelampa().then( result => {

        if (result.affectedRows>0) {
            res.status(200).json(result);
        }
        else
        res.status(404).json({
            message: "Uppdateringen misslyckades."

        });
    }).catch(error => {
        res.status(500).json({
        error: error
        });
    });
});

module.exports = router;





