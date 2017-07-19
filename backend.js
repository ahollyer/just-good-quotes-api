const express = require('express');
const app = express();
const promise = require('bluebird');
/************ API-Related **************/
const body_parser = require('body-parser');
const keygen = require("apikeygen").apikey;
const axios = require('axios');
/*********** DB-Related *************/
const pgp = require('pg-promise')({ promiseLib: promise });
const update_db = require('./update_db');
const query_db = require('./query_db')
/*********** Login-Related ***********/
const session = require('express-session');
const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');

/************************ Database Configuration ***************************/
const db = pgp(process.env.DATABASE || {
  host: 'localhost',
  port: 9004,
  database: 'Quotes',
  user: 'postgres',
});
  ////////////////////////////////////////////////
 // Un-comment to check connection to database //
////////////////////////////////////////////////
// db.query("SELECT text FROM quote LIMIT 5;")
//   .then(function(results) {
//     results.forEach(function(row) {
//         console.log(row.text);
//     });
// });

/************************ E-mail Configuration ******************************/
// var transporter = nodemailer.createTransport({
//   host: process.env['SMTP_HOST'],
//   port: 465,
//   secure: true,
//   auth:{
//     user: process.env['SMTP_USER'],
//     pass: process.env['SMTP_PASSWORD']
//   }
// });

/************************** App Configuration *******************************/
app.set('view engine', 'hbs');
app.use(body_parser.urlencoded({extended: false}));
app.use('/static', express.static('static'));
app.use(session({
  secret: process.env.SECRET_KEY || 'dev',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 6000000}
}));
  ////////////////////////////////////////////////
 // Un-comment to log incoming client requests //
////////////////////////////////////////////////
// app.use(function(request, response, next) {
//   console.log(request.method, request.path);
//   next();
// });

const key = keygen();
console.log(key);

/****************************** API Requests ********************************/
app.get('/api/:key', function(req, res, next) {
  let params = {
    key: req.params.key,
    numQuotes: req.query.numQuotes || 1,
    random: req.query.random,
    author: req.query.author,
    category: req.query.category
  }

  const limitCheck = `SELECT id FROM users WHERE api_key = ${params.key}`;

  db.query(query_db.constructQuery(req, params))
  .then(quotes => {
    // If a quote has multiple categories, combine these into an array
    // on a single quote object
    let response = query_db.combineQueryResults(quotes, params);

    res.json(response);
  })
  .catch(err => {
    next(err);
  })
});

/****************************** App Routes **********************************/
app.get('/', function(req, res) {
  res.render('index.hbs');
});

app.get('/search', function(req, res) {
  res.render('search.hbs');
})

  /////////////////////
 // Developer Tools //
/////////////////////
app.get('/dev/', function(req, res) {
  res.render('dev_info.hbs');
});

app.get('/dev/register/', function(req, res) {
  res.render('register.hbs');
});

app.get('/dev/login/', function(req, res) {
  res.render('login.hbs');
});

app.get('/dev/guide/', function(req, res) {
  res.render('api_guide.hbs');
})


/************************ Database Update Form Routes ************************/
app.get('/add_quote/', function(req, res) {
  update_db.getFormData(req, res, db);
})

app.post('/add_quote/', function(req, res, next) {
  req.body.quote = req.body.quote.replace(/'/g,"''");
     //////////////////////////////////////////////////////////////
    // If form input includes a new author, update the database //
   //  accordingly before inserting the new quote.             //
  //////////////////////////////////////////////////////////////
  if(req.body.newAuthor !== "") {
    req.body.newAuthor = req.body.newAuthor.replace(/'/g,"''");
    const authorInsert = `INSERT INTO author (name)
                          VALUES ('${req.body.newAuthor}');`;
    const authorLookUp = 'SELECT id FROM author ORDER BY id DESC LIMIT 1;'
    // Insert the author into the database
    db.query(authorInsert)
    .then(function() {
      return db.query(authorLookUp);
    })
    // Update the request body to reflect the newly added author's ID
    .then(queryResult => {
      req.body.authorId = queryResult[0].id;
    })
    // Add the quote (with foreign key to author's ID) to the database
    .then(function() {
      update_db.insertQuote(req, res, db);
    })
    .catch(err => {
      console.error(err.stack);
    });
    /////////////////////////////////////////////
   // Otherwise, simply insert the new quote. //
  /////////////////////////////////////////////
  } else {
    update_db.insertQuote(req, res, db);
  }

});

/********************************* Server ************************************/
const PORT = process.env.PORT || 9001;
app.listen(9001, function() {
  console.log(`Listening on port ${PORT}`);
});
