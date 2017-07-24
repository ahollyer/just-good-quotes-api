/********************************************************************
                    Functions for API Requests
*********************************************************************/
function constructQuery(req, params) {
  let query = `SELECT a.name AS author,
                      qc.quote_id AS id,
                      q.text,
                      c.name AS category
              FROM quotecategory qc
              JOIN quote q ON qc.quote_id = q.id
              JOIN author a ON q.author_id = a.id
              JOIN category c ON qc.category_id = c.id `;
    ////////////////////////////////////////////////////////////
   // If user specifies random, simply return random quotes. //
  ////////////////////////////////////////////////////////////
  if(params.random) {
    query += `WHERE qc.quote_id
              IN (SELECT id FROM quote
              ORDER BY RANDOM()
              LIMIT ${params.numQuotes});`;
  }
    //////////////////////////////////////////////////
   // If author supplied, filter quotes by author. //
  //////////////////////////////////////////////////
  if(req.query.author) {
    params.author = req.query.author;
    query += `WHERE a.name ILIKE '${params.author}'`;
  }
    //////////////////////////////////////////////////////
   // If category supplied, filter quotes by category. //
  //////////////////////////////////////////////////////
  if(req.query.category) {
    // Construct appropriate query based on author parameter
    if(req.query.author) {
      query += ' AND ';
    } else {
      query += 'WHERE ';
    }
    // Split categories string into an array.
    params.category = req.query.category.split(',');
    catsRemaining = params.category.length - 1;
    // Iterate over the array, adding each category to the query string.
    query += 'c.name ILIKE ';
    params.category.forEach(term => {
      query += `'${term}'`;
      if(catsRemaining) {
        query += ' OR ';
        catsRemaining -= 1;
      }
    });
  }
    ////////////////////////////////////////////////////////
   // If excludeCat supplied, filter out excluded quotes //
  ////////////////////////////////////////////////////////
  if(req.query.excludeCat) {
    // Split comma-separated values from string into an array
    params.excludeCat = req.query.excludeCat.split(',');
    exCatsRemaning = params.excludeCat.length -1;
    // Iterate over the array, adding each excludeCat to the query string
    query += `WHERE c.name NOT ILIKE `;
    params.category.forEach(term => {
      query += `'${term}'`;
      if(exCatsRemaining) {
        query += ' OR ';
        exCatsRemaining -= 1;
      }
    })
  }
  return query;
}

function combineQueryResults(quotesArray, params) {
  let combined = new Map();
  quotesArray.map(function(q) {
    let quote = combined.get(q.id);
       //////////////////////////////////////////////////////////////
      // If the quote has already been added to the map, push the //
     //  category to that quote's pre-existing categories array. //
    //////////////////////////////////////////////////////////////
    if (quote) {
      quote.categories.push(q.category);
      //////////////////////////////////////////////////////////////////////////
     // Otherwise, add the quote to the map and create its categories array. //
    //////////////////////////////////////////////////////////////////////////
    } else {
      q.categories = [];
      combined.set(q.id, q);
      quote = combined.get(q.id);
      if (q.category) {
        quote.categories.push(q.category);
        delete quote.category;
      }
    }
  });
  // TODO: Query db for only the number of quotes requested
  // Get array from combined map, limit number of results to be returned
  return Array.from(combined.values()).slice(0, params.numQuotes)
}

exports.constructQuery = constructQuery;
exports.combineQueryResults = combineQueryResults;
