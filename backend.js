const express = require('express');
const app = express();
const body_parser = require('body-parser');

var promise = require('bluebird');
var pgp = require('pg-promise')({
  promiseLib: promise
});
var db = pgp({database: 'restaurant'});

app.set('view engine', 'hbs');
app.use(body_parser.urlencoded({extended: false}));
app.use('/static', express.static('public'));

app.use(function (request, response, next) {
  console.log(request.method, request.path);
  next();
});




app.listen(8000, function() {
  console.log('Listening on port 8000');
});
