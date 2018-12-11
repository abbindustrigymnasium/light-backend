const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyparser = require('body-parser');
const lightRoutes= require('./api/routes/light');
const grupp3Routes = require("./api/routes/grupp3");
const grupp10_lightRoutes = require("./api/routes/grupp10_light");
const grupp8Routes = require("./api/routes/grupp-8");
const grupp4_lightRoutes = require("./api/routes/grupp4_light");
const grupp7routes = require("./api/routes/Light7");
const grupp1routes = require("./api/routes/products");
const grupp9_lights = require("./api/routes/grupp9");

var cors = require('cors');
app.use((req, res, next) => {
       // Website you wish to allow to connect
       res.setHeader('Access-Control-Allow-Origin', '*');

       // Request methods you wish to allow
       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   
       // Request headers you wish to allow
       //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
       res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
       // Set to true if you need the website to include cookies in the requests sent
       // to the API (e.g. in case you use sessions)
       res.setHeader('Access-Control-Allow-Credentials', true);
   
       // Pass to next layer of middleware
   
    next();
});

app.use(morgan('dev'));
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use('/light', lightRoutes);
app.use("/grupp3", grupp3Routes);
app.use("/grupp10_light", grupp10_lightRoutes);

app.use("/products", grupp1routes);

app.use("/grupp9", grupp9_lights);
app.use("/grupp-8", grupp8Routes);
app.use("/grupp4_light", grupp4_lightRoutes);
app.use("/grupp7", grupp7routes);


// app.use((req, res, next) => {
//     const error = new Error('Lightswitch');
//     error.status= 404;
//     next(error);
// });

app.use((error,req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports= app;
