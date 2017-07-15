const express = require('express');
const app = express();
const body_parser = require('body-parser');
const promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: promise });

const update_db = require('./update_db');


/************************ Database Configuration ***************************/
const db = pgp(process.env.DATABASE || {
  host: 'localhost',
  port: 5432,
  database: 'Quotes',
  user: 'postgres',
});
  ////////////////////////////////////////////////
 // Un-comment to check connection to database //
////////////////////////////////////////////////
// db.query("SELECT text FROM quote LIMIT 5")
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
app.get('/api/rand/:key', function(req, res) {
  const key = req.params.key;
  console.log('key: ' + key);
  const randomQuery = `SELECT a.name AS author,
                              qc.quote_id AS id,
                              q.text,
                              c.name
                      FROM quotecategory qc
                      JOIN quote q ON qc.quote_id = q.id
                      JOIN author a ON q.author_id = a.id
                      JOIN category c ON qc.category_id = c.id
                      WHERE qc.quote_id
                      IN (SELECT id FROM quote ORDER BY RANDOM() LIMIT 1);`;
  db.query(randomQuery)
  .then(result => {
    console.log(result);
    const categories = result.map((category) => {
      return category.name;
    });
    res.json(
      {
        id: `${result[0].id}`,
        text: `${result[0].text}`,
        author: `${result[0].author}`,
        categories: categories
      }
    );
  })
  .catch(err => {
    console.error('Error inside /api/rand route:');
    console.error(err.stack);
  })
});

/************************ Database Update Form Routes ************************/
app.get('/add_quote/', function(req, res) {
  update_db.getFormData(req, res, db);
})

app.post('/add_quote/', function(req, res, next) {
  req.body.quote = req.body.quote.replace(/'/g,"''");
  // If form input includes a new author, update the database accordingly
  // before inserting the new quote.
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
      console.error('Error inside /add_quote route:');
      console.error(err.stack);
    });
  } else {
    update_db.insertQuote(req, res, db);
  }

});

/**************************** Server ********************************/
const PORT = process.env.PORT || 9001;
app.listen(9001, function() {
  console.log(`Listening on port ${PORT}`);
});
