const express = require('express');
const app = express();
const body_parser = require('body-parser');
const promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: promise });
const keygen = require("apikeygen").apikey;

const update_db = require('./update_db');
const query_db = require('./query_db')


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


/************************** App Configuration *******************************/
app.set('view engine', 'hbs');
app.use(body_parser.urlencoded({extended: false}));
app.use('/static', express.static('public'));
  ////////////////////////////////////////////////
 // Un-comment to log incoming client requests //
////////////////////////////////////////////////
// app.use(function(request, response, next) {
//   console.log(request.method, request.path);
//   next();
// });

const key = keygen();
console.log(key);

/****************************** API Routes **********************************/
app.get('/', function(req, res) {
  res.render('index.hbs')
});

/****************************** API Routes **********************************/
app.get('/api/:key', function(req, res, next) {
  let params = {
    key: req.params.key,
    numQuotes: req.query.numQuotes || 1,
    random: req.query.random,
    author: req.query.author,
    category: req.query.category
  }

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
