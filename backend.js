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


/****************************** API Routes **********************************/
app.get('/', function(req, res) {
  const randomQuery = "SELECT text FROM quote ORDER BY RANDOM() LIMIT 1";
  db.one(randomQuery)
  .then(queryResult => {
    res.json(
      {quote: `${queryResult.text}`}
    );
  })
});

/*************************** Database Update Form ***************************/

  ///////////////////////////////////////////////////////////////////////////
 // On GET, generate quote form, pulling most recent values from database //
///////////////////////////////////////////////////////////////////////////
function getFormData(req, res) {
  const authorQuery = "SELECT name, id FROM author ORDER BY name ASC";
  const catQuery = "SELECT name, id FROM category ORDER BY name ASC";

  let queryResults = [];
  queryResults.push(req);

  // Query for author, push to output array
  db.query(authorQuery)
  .then(authorResults => {
    queryResults.push(authorResults);
  })
  .then(function() {
    // Query for category, push to output array
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

  ///////////////////////////////////////////////////////////////
 // On POST, read form input and update database accordingly. //
///////////////////////////////////////////////////////////////
function insertQuote(req, res) {

  const quoteInsert = `INSERT INTO quote (text, author_id) \
    VALUES ('${req.body.quote}', ${req.body.authorId});`;
  db.query(quoteInsert)
  // Get the newly added quote ID
  .then(function(){
    const quoteLookUp = 'SELECT id FROM quote ORDER BY id DESC LIMIT 1;';
    return db.query(quoteLookUp);
  })
  // If there are any checked categories, insert them in the xref table
  .then(function(quoteId){
    if(req.body.category) {
      for (let i = 0; i < req.body.category.length; i++) {
        const quoteCatInsert = `INSERT INTO quotecategory (quote_id, category_id) \
          VALUES (${quoteId[0].id}, ${req.body.category[i]});`;
        db.query(quoteCatInsert)
      }
    }
    return quoteId;
  })
  .then(function(quoteId){
    // Add new category if needed
    if(req.body.newCategory === "") {
    }
    else {
      req.body.newCategory = req.body.newCategory.replace(/'/g,"''");
      const catInsert = `INSERT INTO category (name) \
        VALUES ('${req.body.newCategory}')`;
      db.query(catInsert)
      // Get ID of newly added category
      .then(function(){
        const catLookUp = `SELECT id FROM category ORDER BY id DESC LIMIT 1;`;
        return db.query(catLookUp)
      })
      // Insert new category ID in xref table
      .then(function(catId){
        const newQuoteCatInsert = `INSERT INTO quotecategory \
        (quote_id, category_id) \
        VALUES (${quoteId[0].id}, ${catId[0].id})`;
        db.query(newQuoteCatInsert)
    })}
    return quoteId;
  })
  .then(function(){
    getFormData(req, res);
  })
  .catch(err => {
    console.error(err.stack);
  });
}


  ///////////////////////////////////
 // Routes - database update form //
///////////////////////////////////
app.get('/add_quote/', function(req, res) {
  getFormData(req, res);
})

app.post('/add_quote/', function(req, res, next) {
  req.body.quote = req.body.quote.replace(/'/g,"''");

     //////////////////////////////////////////////////////////////////////////
    // If form input includes a new author, update the database accordingly //
   //  before inserting the new quote.                                     //
  //////////////////////////////////////////////////////////////////////////
  if(req.body.newAuthor !== "") {
    req.body.newAuthor = req.body.newAuthor.replace(/'/g,"''");

    const authorInsert = `INSERT INTO author (name) VALUES \
    ('${req.body.newAuthor}');`;
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
    .then(function() {
      insertQuote(req, res);
    })
    .catch(err => {
      console.error(err.stack);
    });
   ////////////////////////////////////////////////////////////////
  // Else if no new author, just add the quote to the database. //
 ////////////////////////////////////////////////////////////////
  } else {
    insertQuote(req, res);
  }

});

/**************************** Server ********************************/
app.listen(8000, function() {
  console.log('Listening on port 8000');
});
