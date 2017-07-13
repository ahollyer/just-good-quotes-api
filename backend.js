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
app.get('/', function(req, res) {
  res.json(
    {message: 'This is an API Chump!'}
  );
});

/*************************** Databse Update Form ***************************/

  ///////////////////////////////////////////////////////////////////
 // Generate quote form, pulling most recent values from database //
///////////////////////////////////////////////////////////////////
function addQuote(req, res) {
  let queryResults = [];
  queryResults.push(req);

  // Query for author, push to output array
  const authorQuery = "SELECT name, id FROM author ORDER BY name ASC";
  db.query(authorQuery)
  .then(authorResults => {
    queryResults.push(authorResults);
  })
  .then(function() {
    //Query for category, push to output array
    const catQuery = "SELECT name, id FROM category ORDER BY name ASC";
    return db.query(catQuery);
  })
  .then(catResults => {
    queryResults.push(catResults);
    return queryResults;
  })
  .then(function(queryResults){
    res.render('add_quote.hbs', {
      title: 'Add New Quote',
      req: queryResults[0],
      author: queryResults[1],
      category: queryResults[2],
    });
  })
}

  /////////////////////////////////
 // Database update form routes //
/////////////////////////////////
app.get('/add_quote/', function(req, res) {
  addQuote(req, res);
})

app.post('/add_quote/', function(req, res, next) {
  req.body.quote = req.body.quote.replace(/'/g,"''");
  function insertQuote(req, res) {
    // Add one to one values in the quote table
    db.query(`INSERT INTO quote (text, author_id) \
      VALUES ('${req.body.quote}', ${req.body.authorId});`)
    // Get the newly added quote ID
    .then(function(){
      return db.query('SELECT id FROM quote ORDER BY id DESC LIMIT 1;');
    })
    // If there are any checked categories, insert them here in xref table
    .then(function(quoteId){
      if(req.body.category) {
        for (let i = 0; i < req.body.category.length; i++) {
          db.query(`INSERT INTO quotecategory \
            (quote_id, category_id) VALUES (${quoteId[0].id}, ${req.body.category[i]});`)
        }
      }
      return quoteId;
    })
    .then(function(quoteId){
      // Add new category if needed
      if(req.body.addCategory==="") {
      }
      else {
        req.body.addCategory = req.body.addCategory.replace(/'/g,"''");
        db.query(`INSERT INTO category (name) VALUES ('${req.body.addCategory}')`)
        // Get ID of newly added category
        .then(function(){
          return db.query(`SELECT id FROM category ORDER BY id DESC LIMIT 1;`)
        })
        // Insert new category ID in xref table with quote ID
        .then(function(catId){
          db.query(`INSERT INTO quotecategory (quote_id, category_id) \
            VALUES (${quoteId[0].id}, ${catId[0].id})`)
      })}
      return quoteId;
    })
    .then(function(){
      addQuote(req, res);
    })
    .catch(err => {
      console.error(err);
    });
  }
  insertQuote(req, res);
});

/**************************** Server ********************************/
app.listen(8000, function() {
  console.log('Listening on port 8000');
});
