const express = require("express");
const router = express.Router();

var mysql = require("mysql");
var connection = mysql.createConnection({
    host : "iot.abbindustrigymnasium.se",
    user : "ljuside1",
    password : "ytterplagg",
    database : "ljuside1",
});

connection.connect(function(error) {
    if (error){
        throw error;
    }
    else
    console.log("Thats all there is to it");
});

var Values_fromDB;
var CronJob = require("cron").CronJob;
new CronJob("* * * * * *", function() {
    var GetLight = function () {
        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM ddosmonster", function (error, result) { //switch???
                if (error) {
                    return reject(error);
                } else {
                    return resolve(result);
                }
            });
        });
    }
    GetLight().then(response => {
        Values_fromDB = response;
        console.log(Values_fromDB);
    })
}, null, true, "America/Los_Angeles");

router.get("/:lampName", (req, res) => {
    var found=false;
    var Outputvalue;
    Values_fromDB.forEach(element => {
        if (element.name == req.params.lampName) {
            found=true;
            Outputvalue = element;
        }
    });
    if (found != true) {
        res.status(200).json({name: "none",
        message: "No such lamp exists"})
    } else {
        res.status(200).json(Outputvalue);
        console.log(Outputvalue);
    }
});

router.get("/", (req, res, next) => {
    res.status(200).json(Values_fromDB);
});

router.post("/", (req, res, next) => {
    Lights = [req.body.name, req.body.hard, req.body.strength];
    console.log(req.body);
    var createProduct = function() {
        return new Promise(function (resolve, reject){
            connection.query("INSERT INTO ddosmonster (Name, Strength) VALUES ?", [[Lights]], function (error, result) { //hade fields
                if (error){
                    return reject(error);
                } else {
                    return resolve(Lights);
                }
            });
        });
    }

createProduct().then(Theproduct => {
    res.status(200).json({
        message: "Successfully added light",
    });
}).catch(error => {
        res.status(500).json({
        error: error
        });
    });
});

router.patch("/", (req, res) => {
    Lights = [req.body.Strength, req.body.Name];
    console.log(req.body);
    var createProduct = function () {
        return new Promise(function (resolve, reject) {
            connection.query("UPDATE ddosmonster SET `Strength` = ? WHERE `Name` = ?", [Lights[0], Lights[1]], function (error, result) { //switch?
                if (error) {
                    return reject(error);
                } else {
                    return resolve(result);
                }
            });
        });
    }

    createProduct().then(Theproduct => {
        console.log(Theproduct);
        res.status(200).json({
            message: "Success, light updated"
        });
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
    });
});

module.exports = router;
