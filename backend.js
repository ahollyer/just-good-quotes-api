'use strict';
const express = require('express');
const app = express();
// const body_parser = require('body-parser');

/************ Database *************/
const promise = require('bluebird');
const pgp = require('pg-promise')({
  promiseLib: promise
});
const db = pgp({
  host: 'localhost',
  port: 9002,
  database: 'Quotes',
  user: 'postgres',
});

// NOTE: Sample query: Un-Comment to check connection to database
db.query("SELECT * FROM quote")
  .then(function(results) {
    results.forEach(function(row) {
        console.log(row.text);
    });
  //   return db.one("SELECT * FROM restaurant WHERE name='tout suit'");
 })




app.set('view engine', 'hbs');
// app.use(body_parser.urlencoded({extended: false}));
app.use('/static', express.static('public'));

app.use(function (request, response, next) {
  console.log(request.method, request.path);
  next();
});



/************ Routes ****************/
app.listen(8000, function() {
  console.log('Listening on port 8000');
});
