const express = require('express');
const router = express.Router();
var mysql = require("mysql");

var con = mysql.createConnection({           // Skapar kontakt med vår databas.
    host: "iot.abbindustrigymnasium.se",    // Vår host, där databasen ligger
    user: "ljuside4",                      // Användare av databasen
    password:"rakvatten",                 //Lösenord
    database: "ljuside4"                 //Själva namnet på databasen
});

var Values_fromDB;
var cron = require('node-cron');         // Använder node-cron för att hämta värden 
new cron.schedule('*/10 * * * * *', () => {        // Intervallet för när den ska hämta värden. Var tionde sekund.

    var GetLight = function () {
        return new Promise(function (resolve, reject) {
            con.query("SELECT * FROM lampa", function (err, result){  // Här säger vi att den ska hämta värdena från tabellen lampa
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
    })
});
con.connect(function (err) {
    if (err) throw err;
});


router.get('/', (req, res) => {       // Generell GET metod som hämtar alla värden.
    res.status(200).json({
        message: 'Hämtar alla värden',     // Ett meddelande som säger att den hämtar värden.
        result: Values_fromDB
    });   
});

router.get('/:lampaNamn', (req, res) => {     // GET som hämtar värden från databasen via lampa och dess Namn.
    var found=false;
    var Outputvalue
    Values_fromDB.forEach(element => {
        if (element.Namn == req.params.lampaNamn) {
            found = true;
            Outputvalue = element;

        }
    });
    if (found!= true) {                 // Om lampan/Namnet inte hittas kommer ett meddelande
    res.status(200).json({Namn: "none",
    message: "Lampan existerar inte"});  // Detta är meddelandet
    }
    else
    {
        res.status(200).json(Outputvalue);   // Om lampan däremot finns så skickar tabellen ut dess värden.
        console.log(Outputvalue);
    }  
});


router.post('/', (req, res) => {                                       // POST som skickar nya värden till databasen.
    const ljuspost=[req.body.Namn, req.body.Styrka, req.body.Mode];   // Vår konst har värdena Namn, Styrka och Mode.


    var createProduct = function(){                           
        return new Promise(function(resolve,reject){ 
            console.log(ljuspost);
            con.query('INSERT INTO lampa(Namn, Styrka, Mode) VALUES ?',[[ljuspost]], function(err,result) { /* Lägger in våra värden i tabellen lampa och värdena
                                                                                                 som den lägger in är Namn, styrka och mode. I den ordningen. 
                                                                                                Där den placerar dessa värden är i vår ljuspost.*/
      
              if(err)               // Om det sker ett fel, skicka ett error medddelande.
                  return reject(err); 
              
              else                 // Om inte, skicka ljuspost dvs resultatet för POST.
                           
                  return resolve(ljuspost);

      
          }); 
        }) 
      }

    createProduct().then( ljuspost => {console.log(ljuspost);  // Vår skapade produkt visar värdena som publicerat
        res.status(200).json({ 
            message: "Ny lampa skapad"  // Meddelandet som kommer när en lampa skapas.
    });
    
    
    }).catch(err => {      // Om ett fel sker skicka error meddelande.
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/', (req, res, next) => {         // Vår PATCH som updaterar värdena i tabellen

    var UpdateProduct = function(){
    const ljusupd=[req.body.Styrka, req.body.Mode, req.body.Namn];   // Vår ljusupd har värdena Styrka, Mode och Namn som ska uppdateras
                                                                     // ljusupd är en array med dessa värden.

        return new Promise(function(resolve,reject){
            
            con.query("UPDATE `lampa` SET `Styrka`=? , `Mode`= ? WHERE `Namn` =  ?",[ljusupd[0] , ljusupd[1], ljusupd[2]], function (err, result, fields) {
                              // Här uppdaterar vi tabellen lampa och sätter allting till okända värden då namnet är okänt.
                              // Sedan tar den det första värdet i ljusupd som är styrka för att lägga in ett nytt värde. Den tar det första, andra och tredje värdet i array.

              if(err){                // Om det blir fel, skicka ut felet.      
                  return reject(err);
              }else{                      // Annars, skicka resultatet dvs uppdateringen.
                  return resolve(result);
              }
      
          }); 
        }); 
      } 

      UpdateProduct().then( result => {
          console.log(result);
        if (result.affectedRows>=1) {      // Om allt fungerar så uppdaterar den
            res.status(200).json(result);
        }
        else
        res.status(200).json({message: "Kan inte uppdatera"});  //Annars skickar den ut ett meddelande om att det inte kan uppdatera
       }).catch(err => {
      res.status(500).json({
          error: err
      });
  });
  
});

 
router.delete('/:lampaNamn', (req, res, next) => {        // DELETE för att radera ett värde via dess namn


    var RemoveProduct = function(){
        return new Promise(function(resolve,reject){
            const Namn = req.params.lampaNamn;
            con.query("DELETE FROM lampa WHERE `Namn` = ?", [Namn], function (err, result, fields) { // Raderar en lampa när vi skriver in namnet.
      
              if(err){                  
                  return reject(err);
              }else{              
                  return resolve(result);
              }
      
          }); 
        });
      } 

      RemoveProduct().then( result => {
          if (result.affectedRows>=1) {
              res.status(200).json(result);
          }
          else
          res.status(200).json({message: "Kan inte radera"}); // Samma som innan, fungerar det får vi bort värdet annars kommer detta meddelande.
         }).catch(err => {
        res.status(500).json({
            error: err
        });
 });

});

var Values_fromDB;
module.exports = router;

