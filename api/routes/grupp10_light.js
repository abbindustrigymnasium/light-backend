const express = require('express');

const router = express();

var mysql = require("mysql");

var con = mysql.createConnection({

    host: "iot.abbindustrigymnasium.se",

    user: "gruppett",

    password: "fiskflyg",

    database: "gruppett"

});



con.connect(function (err) {

    if (err) throw err;

});







var Values_fromDB;

var cron = require('node-cron');
 
cron.schedule('* * * * * *', () => {
  

  

    var GetLight = function () {

        return new Promise(function (resolve, reject) {

            con.query("SELECT * FROM light", function (err, result) {

                if (err) {

                    return reject(err);

                } else {

                    return resolve(result);

                }



            });

        });

    }

    GetLight().then(response =>{

        Values_fromDB= response;

        //console.log(Values_fromDB);

    })

});









router.get('/:lampName', (req, res) => {

    var found=false;

    var Outputvalue;

    Values_fromDB.forEach(element => {

        if (element.name== req.params.lampName) {

            found=true;   

            Outputvalue =element;

        

        }

    });

    if (found!= true) {

    res.status(200).json({name: "none",

    message: "No such lamp exists"});

    }

    else

    {

        res.status(200).json(Outputvalue);

        console.log(Outputvalue);

    }

    });



router.get('/', (req, res, next) => {



    res.status(200).json(Values_fromDB);

});



router.post('/', (req, res) => { //  '/'= indexfilen i localhost/products/   req = request , res= resultat , next = det som ska hända senare 



    Lights = [req.body.name, req.body.hard, req.body.strength];

    console.log(req.body); //Här skriver jag ut req.body för att se skillnaden på den mellan en postman request och en html.

    var createProduct = function () { //Skapar funktionen

        return new Promise(function (resolve, reject) { //Skapar löftet

            con.query('INSERT INTO light (name, hard,strength) VALUES ?', [[Lights]], function (err, result) {



                if (err) {

                    return reject(err);

                } else {

                    return resolve(Lights);

                }



            }); // query

        }); // Promise

    } // getDepartments



    createProduct().then(Theproduct => {

        res.status(200).json({ //Här kan man som jag gjort lägga till en status 200, OBS tänk på att 201 kommer

            message: "Success, new light logged" //I detta exempel skickar 200 bara produkten medans 201 skickar meddelandet med.

        });

        //Tog bort res.status(201) då dubbla status skickningar skapar error, vill man ha möjlighet till bägge så gör if else satser och lägg dem i.



    }).catch(err => {

        console.log(err);

        res.status(500).json({

            error: err

        });

    });

});



router.patch('/', (req, res) => { //  '/'= indexfilen i localhost/products/   req = request , res= resultat , next = det som ska hända senare 

    Lights = [req.body.hard, req.body.strength, req.body.name];

    console.log(req.body); //Här skriver jag ut req.body för att se skillnaden på den mellan en postman request och en html.

    var createProduct = function () { //Skapar funktionen

        return new Promise(function (resolve, reject) { //Skapar löftet

            con.query('UPDATE light SET `hard` = ? , `strength` = ? Where `name` = ?', [Lights[0], Lights[1], Lights[2]], function (err, result) {



                if (err) {

                    return reject(err);

                } else {

                    return resolve(Lights);

                }



            }); // query

        }); // Promise

    } // getDepartments



    createProduct().then(Theproduct => {

        res.status(200).json({ //Här kan man som jag gjort lägga till en status 200, OBS tänk på att 201 kommer

            message: "Success, light updated" //I detta exempel skickar 200 bara produkten medans 201 skickar meddelandet med.

        });



    }).catch(err => {

        console.log(err);

        res.status(500).json({

            error: err

        });

    });

});





var pool = mysql.createPool({

    connectionLimit: 100,

    connectTimeout: 500000,

    acquireTimeout: 500000,

    queueLimit: 30,

    host: 'localhost',

    user: 'root',

    password: '',

    database: 'light',

    multipleStatements: true,

});





module.exports = router;

