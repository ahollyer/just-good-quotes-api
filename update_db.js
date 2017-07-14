/********* Functions for database update form page **********/
function getFormData (req, res, db) {
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

function insertQuote (req, res, db) {
  const quoteInsert = `INSERT INTO quote (text, author_id)
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
        const quoteCatInsert = `INSERT INTO quotecategory
                                (quote_id, category_id)
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
      const catInsert = `INSERT INTO category (name)
                         VALUES ('${req.body.newCategory}')`;
      db.query(catInsert)
      // Get ID of newly added category
      .then(function(){
        const catLookUp = `SELECT id FROM category ORDER BY id DESC LIMIT 1;`;
        return db.query(catLookUp)
      })
      // Insert new category ID in xref table
      .then(function(catId){
        const newQuoteCatInsert = `INSERT INTO quotecategory
                                   (quote_id, category_id)
                                   VALUES (${quoteId[0].id}, ${catId[0].id})`;
        db.query(newQuoteCatInsert)
    })}
    return quoteId;
  })
  .then(function(){
    getFormData(req, res, db);
  })
  .catch(err => {
    console.error(err.stack);
  });
}

exports.getFormData = getFormData;
exports.insertQuote = insertQuote;
