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
       

    //res.status(200).json({ 
       // message: 'Getter'
  //  });
});

router.post('/', (req, res, next) => {
    const Lampa = {
        ID: req.body.ID,
        Temperatur: req.body.Temperatur,
        Ljusstyrka: req.body.Ljusstyrka
    };
    
var CreatedLampa = function(){
    return new Promise(function(resolve, reject){
        var TheLampa = [Lampa.ID, Lampa.Temperatur, Lampa.Ljusstyrka];
        console.log(Theproduct);
        con.query('INSERT INTO Lampa (ID.Temperatur.Ljusstyrka) VALUES ?', [[TheLampa]], function(error, results, fields) {
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


router.get('/:LampaID', (req, res, next) => {
    const name = req.params.LampaID;

    var getproduct = function(){
        return new Promise(function(resolve, reject){
            con.query('SELECT * FROM Lampa WHERE ID = ?', [ID], function(error, results, fields) {
                if (error)
                return reject (error);
                else 
                return resolve(results)
    
            })
        });
    }
    
    
    getproduct().then( result => {
        if(result.length==0){
            res.status(404).json({
                message:"No such vallues exists."
            });
        }
        else
    res.status(200).json(result);
        
          
        res.status(500).json({
    } ).catch(error => {
            error: error
        })
    });
    
 } );

router.patch('/', (req, res, next) => {


    const lampa = {
        ID: req.body.ID,
        Temperatur: req.body.Temperatur,
        Ljusstyrka: req.body.Ljusstyrka
    };

    var updateproduct = function(){
        return new Promise(function(resolve, reject){
            
            con.query('UPDATE `lampa` SET `Temperatur`=?, `Ljusstyrka`=? WHERE ID = ?', [ lampa.Temperatur, lampa.Ljusstyrka, lampa.ID], function(error, results, fields) {
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

// router.delete('/', (req, res, next) => {


//     const product = {
//         ID: req.body.ID
//     };

//     var Destroyproduct = function(){
//         return new Promise(function(resolve, reject){
            
//             con.query('DELETE FROM `Lampa` WHERE ID = ?', [Lampa.ID], function(error, results, fields) {
//                 if (error)
//                 return reject (error);
//                 else 
//                 return resolve(results)
    
//             })
//         });
//     }
    
    
//     Destroyproduct().then( result => {

//        if(result.length!=0) {
//             res.status(200).json({
//                 message: "Product was deleted."
//             });
//         }
//         else
//         res.status(404).json(result);{
            
//         };   
       
//     } ).catch(error => {
//            res.status(500).json({ 
//                 error: error
//         });
//     })
    
// });

module.exports = router;
