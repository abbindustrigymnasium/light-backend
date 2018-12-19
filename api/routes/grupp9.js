const express = require ('express');
const router = express.Router();

var mysql      = require('mysql');
var con = mysql.createConnection({
  host     : 'iot.abbindustrigymnasium.se',     //Länken dit Php-databasen vi använder oss av ligger
  user     : 'ljuside9',        //Detta är inloggningsdetaljerna som gör så att vi får tillgång till Php-databasen som ligger på länken ovan
  password : 'idolarne',
  database : 'ljuside9'
});
 
con.connect(function(err){ // Denna connectar till databasen. 
    if (err){
        throw err;
    }
    else
    console.log("funkar"); // Meddelande när det har connectat. 
});
 

// router.get('/', (req, res, next) => {       //Detta gör så att vi väljer rätt mapp och databas när vi ska HÄMTA värden, denna GET hämtar alla värden i tabellen.

//     con.query('SELECT * FROM Lampa', function (error, results, fields) {
//         if (error) throw error;
//         res.status(200).json({
//             message: 'Getter',
//             result:results});
//         console.log('The solution is: ', results[0].ID);    //Detta gör så att vi hämtar rätt värden från den rätta filen, vi ska alltså ansluta hämta värden från rowen med ID 1
//       });
       

// });

// router.get('/', (req,res)=>{
//     res.status(200).json({
//         message: "Lampa:",
//         result: Ljus});
// });

// var Ljus;
// var cron = require('node-cron');

// cron.schedule('* * * * * *', () => {

//     var Lampa = funktion(){

//         return new Promise(function(resolve,reject){
//             con.query('SELECT * FROM Lampa' , function (error,result, fields){
//                 if (error)
//                 return reject (error);
//                 else 
//                 return resolve(result);

//                 });
//             });
        
//     }

// Lampa().then(response =>{
//     Ljus= response;
// })
// }, null, true, "America/Los-angeles");

var Values_fromDB;
var cron = require('node-cron');

cron.schedule('* * * * * *', () => {

    var GetLight = function() {
        return new Promise(function (resolve, reject) {
            con.query("SELECT * FROM lampa", function (err, result) {
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

     //console.log(Values_fromDB);
    })

});


router.get('', (req, res) => {
  res.status(200).json(Values_fromDB[0]);
  //console.log(Values_fromDB);
 
});

// router.post('/', (req, res, next) => {
//     const Lampa = {
//         ID: req.body.ID,
//         Temperatur: req.body.Temperatur,
//         Ljusstyrka: req.body.Ljusstyrka,
//         Mode: req.body.Mode
//     };
    
// var createLampa = function(){
//     return new Promise(function(resolve, reject){
        
//         var TheLampa = [Lampa.ID, Lampa.Temperatur, Lampa.Ljusstyrka, Lampa.Mode];
//         console.log(TheLampa);
//         con.query('INSERT INTO lampa (ID, Temperatur, Ljusstyrka, Mode) VALUES ?', [[TheLampa]], function(error, results, fields) {
//             if (error)
//             return reject (error);
//             else 
//             return resolve(results);         
//         })
//     });
// }

// createLampa().then( TheLampa => {
//     res.status(201).json({
//         message:"Success , new product",
//         Lampa : TheLampa
//     })
// } ).catch(error => {
//     res.status(500).json({
//         error: error
//     })
// })
// }  )
//Vi kommenterade koden ovanför för att vi inte behöver den i den versionen appen är i idag, men vi vet inte om vi vill ändra på det i framtiden

router.get('/:LampaID', (req, res, next) => { // GET hämtar värdena i databasen, å det inte nollställs om man går ut i appen o sen in igen. 
    // const ID = req.params.LampaID;
    res.status(200).json(Values_fromDB[0]);
    // var getproduct = function(){  // Denna GET hämtar specifika värden. 
    //     return new Promise(function(resolve, reject){
    //         con.query('SELECT * FROM lampa WHERE ID = ?', [ID], function(error, results, fields) {
    //             if (error)
    //             return reject (error);
    //             else 
    //             return resolve(results)
    
    //         })
    //     });
    // }
    
    
    // getproduct().then( result => { // Vad som ska ske om det inte fungerar. 
    //     if(result.length==0){
    //         res.status(404).json({
    //             message:"No such values exists."
    //         });
    //     }
    //     else
    // res.status(200).json(result[0]); // Om det funnkar ska resultat skickas. 
        
          
       
    // } ).catch(error => {
    //     res.status(500).json({    error: error // Berättar om ytterligare ett error. 
    //     })
    // });  
    
 } );

router.patch('/', (req, res, next) => { // Patch finns till för att uppdatera databasens värden, exempelvis om ljusstyrka eller temperatur förändras. 


    const lampa = { // Ger namn åt de variabler som hör till vilken tabell del. 
        ID: req.body.ID,
        Temperatur: req.body.Temperatur,
        Ljusstyrka: req.body.Ljusstyrka,
        Mode: req.body.Mode
    };

    var updateproduct = function(){ // berättar vad och vart det ska patchas. 
        return new Promise(function(resolve, reject){
            
            con.query('UPDATE `lampa` SET `Temperatur`=?, `Ljusstyrka`=?, `Mode`=? WHERE `ID` = ?', [ lampa.Temperatur, lampa.Ljusstyrka, lampa.Mode, lampa.ID], function(error, results, fields) {
                if (error)
                return reject (error); // Om det inte går så får användaren infon error. 
                else 
                return resolve(results) // Om det funkar får användaren infon med resultaten som ändrats. 
    
            })
        });
    }
    
    
    updateproduct().then( result => { // Den här berättar vilken info användaren ska få när det har patchats. 

        
       if(result.affectedRows>0) {
        res.status(200).json(result);
        }
        else
        res.status(404).json(result,
            {
            message: "Update imposible, lack of values." // Berättar vad användaren ska få om det inte går. 
        });  
      
          
       
    } ).catch(error => {
           res.status(500).json({  error: error
        });
    })
    
});

module.exports = router;

