const express = require('express');
const app = express();
const body_parser = require('body-parser');
const promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: promise });

const update_db = require('./update_db');


/************************ Database Configuration ***************************/
const db = pgp(process.env.DATABASE || {
  host: 'localhost',
  port: 9005,
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


/****************************** API Routes **********************************/
app.get('/', function(req, res) {
  res.render('index.hbs')
});

function queryConstructor(req, params) {
  // Create join table, select fields to be returned
  let query = `SELECT a.name AS author,
                      qc.quote_id AS id,
                      q.text,
                      c.name AS category
              FROM quotecategory qc
              JOIN quote q ON qc.quote_id = q.id
              JOIN author a ON q.author_id = a.id
              JOIN category c ON qc.category_id = c.id `;
    /////////////////////////////////////////////////////////////
   // If user specifies random, simply return a random quote. //
  /////////////////////////////////////////////////////////////
  if(params.random) {
    query += `WHERE qc.quote_id
              IN (SELECT id FROM quote
              ORDER BY RANDOM()
              LIMIT 1);`;
  }
    //////////////////////////////////////////////////
   // If author supplied, filter quotes by author. //
  //////////////////////////////////////////////////
  if(req.query.author) {
    // console.log('Author: ' + req.query.author);
    params.author = req.query.author;
    query += `WHERE a.name ILIKE '${params.author}'`;
  }
    //////////////////////////////////////////////////////
   // If category supplied, filter quotes by category. //
  //////////////////////////////////////////////////////
  if(req.query.category) {
    // Split categories string into an array.
    params.category = req.query.category.split(',');
    catsRemaining = params.category.length - 1;
    // Iterate over the array, adding each category to the query string.
    query += `WHERE c.name ILIKE `
    params.category.forEach(term => {
      query += `'${term}'`;
      if(catsRemaining) {
        query += ' OR ';
        catsRemaining -= 1;
      }
    });
  }

  return query;
}


app.get('/api/:key', function(req, res, next) {
  let resultsArray = [];
  let params = {
    key: req.params.key,
// TODO: Figure out how to return a specified number of quotes
    numQuotes: req.query.numQuotes || 1,
    random: req.query.random,
    author: req.query.author,
    category: req.query.category
  }

  db.query(queryConstructor(req, params))
  .then(quotes => {
    console.log(quotes);
    // Map results of db.query to an array
    let quotesArray = quotes.map(quote => {
      return quote;
    });
    // Reduce the array to consolidate categories
    console.log('The quotes array: ' + quotesArray);
    let categories = quotes.map(quote => {
      return quote.category;
    });

// TODO: Allow multiple results, pushed to resultsArray
    // Return requested data to the client
    res.json(quotesArray
      // {
      //   id: quotes[0].id,
      //   quote: quotes[0].text,
      //   author: quotes[0].author,
      //   categories: categories
      // }
    );
  })
  .catch(err => {
    console.error(err.stack);
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
