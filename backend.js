'use strict';
const express = require('express');
const app = express();
const body_parser = require('body-parser');
const promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: promise });


/************************ Database Configuration ***************************/
const db = pgp({
  host: 'localhost',
  port: 9002,
  database: 'Quotes',
  user: 'postgres',
});

  //////////////////////////////////////////////////////////////
 // Sample query: Un-comment to check connection to database //
//////////////////////////////////////////////////////////////
// db.query("SELECT * FROM quote")
//   .then(function(results) {
//     results.forEach(function(row) {
//         console.log(row.text);
//     });
// });


/************************** App Configuration *******************************/
app.set('view engine', 'hbs');
app.use(body_parser.urlencoded({extended: false}));
app.use('/static', express.static('public'));

  ////////////////////////////////////////////////
 // Un-comment to log incoming server requests //
////////////////////////////////////////////////
// app.use(function (request, response, next) {
//   console.log(request.method, request.path);
//   next();
// });


/********************************* Routes ***********************************/
app.get('/', function (request, response) {
  response.json(
    {message: 'This is an API Chump!'}
  );
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
