const express = require ('express');
const router = express.Router();

var mysql      = require('mysql');
var con = mysql.createConnection({
  host     : 'iot.abbindustrigymnasium.se',
  user     : 'ljuside9',
  password : 'idolarne',
  database : 'ljuside9'
});
 
con.connect(function(err){
    if (err){
        throw err;
    }
    else
    console.log("funkar");
});
 

router.get('/', (req, res, next) => {

    con.query('SELECT * FROM Lampa', function (error, results, fields) {
        if (error) throw error;
        res.status(200).json({
            message: 'Getter',
            result:results});
        console.log('The solution is: ', results[0].ID);
      });
       

});

router.post('/', (req, res, next) => {
    const Lampa = {
        ID: req.body.ID,
        Temperatur: req.body.Temperatur,
        Ljusstyrka: req.body.Ljusstyrka,
        Mode: reqbody.Mode
    };
    
var createLampa = function(){
    return new Promise(function(resolve, reject){
        
        var TheLampa = [Lampa.ID, Lampa.Temperatur, Lampa.Ljusstyrka, Lampa.Mode];
        console.log(TheLampa);
        con.query('INSERT INTO lampa (ID, Temperatur, Ljusstyrka, Mode) VALUES ?', [[TheLampa]], function(error, results, fields) {
            if (error)
            return reject (error);
            else 
            return resolve(TheLampa)

            
          
        })
    });
}


createLampa().then( TheLampa => {
    res.status(201).json({
        message:"Success , new product",
        Lampa : TheLampa
    })
} ).catch(error => {
    res.status(500).json({
        error: error
    })
})

}  )


router.patch('/', (req, res, next) => {


    const lampa = {
        ID: req.body.ID,
        Temperatur: req.body.Temperatur,
        Ljusstyrka: req.body.Ljusstyrka
    };

    var updateproduct = function(){
        return new Promise(function(resolve, reject){
            
            con.query('UPDATE `lampa` SET `Temperatur`=?, `Ljusstyrka`=?, `Mode`=? WHERE ID = ?', [ lampa.Temperatur, lampa.Ljusstyrka, lampa.Mode, lampa.ID], function(error, results, fields) {
                if (error)
                return reject (error);
                else 
                return resolve(results)
    
            })
        });
    }
    
    
    updateproduct().then( result => {

        
       if(result.affectedRows>0) {
        res.status(200).json(result);
        }
        else
        res.status(404).json(result,
            {
            message: "Update imposible, lack of values."
        });  
      
          
       
    } ).catch(error => {
           res.status(500).json({  error: error
        });
    })
    
});

module.exports = router;
