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
const auth = require('./auth');

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
  res.render('index.hbs', {title: 'Uplifting Quotes'});
});

app.get('/search', function(req, res) {
  res.render('search.hbs', {title: 'Uplifting Quotes: Search'});
})

  /////////////////////////////////////
 // Developer Tools, API Use Guides //
/////////////////////////////////////
app.get('/dev/', function(req, res) {
  let account = req.session.user || null;
  let context = {
    account: account,
    title: 'Uplifting Quotes - Developer Panel'
  };
  // If not logged in, redirect user to developer welcome screen.
  if(account === null) {
    res.redirect('/dev/welcome/');
    return;
  }
  // Check if account is verified, pass to front end
  if(account.verified) {
    context['verified'] = true;
  }
  // Get apps associated with the account, pass to front end
  const appQuery = `SELECT * FROM app
                    WHERE user_id = ${account.id} AND active
                    ORDER BY name`;
  db.query(appQuery)
  .then(apps => {
    // Check for api keys associated with apps, pass to front end
    apps.forEach(app => {
      if(app.api_key.length === 50) {
        app['key_present'] = true;
      }

    context['apps'] = apps;
    context['numKeys'] = apps.length;

    res.render('dev_panel.hbs', context);
    })
  })
  .catch(function(err) {
    console.error(err.stack);
  })

});

app.get('/dev/welcome/', function(req, res) {
  res.render('dev_info.hbs', {title: 'Uplifting Quotes: Welcome'});
})

app.get('/dev/guide/', function(req, res) {
  res.render('api_guide.hbs', {title: 'Uplifting Quotes: Getting Started'});
})

  ////////////////////////////////////////
 // Developers - Create Account, Login //
////////////////////////////////////////
// Creating an account
app.get('/dev/register', function(request, response) {
  context = {
    title: 'Uplifting Quotes: Create Account',
    login: request.session.user,
    anon: !request.session.user,
  };
  response.render('register.hbs', context)
});

// Mechanics for creating an account
//    Generates unique verification key, sends to user in email
//    It is required that they verify in order to use the API
app.post('/dev/register', function(request, response, next){
  let login = request.body.login;
  let password = request.body.password;
  let name = request.body.name;
  let pub = request.body.public;
  if (pub == 'on') {
    pub = true;
  }
  unique_ver_key()  // promise returning unique key
  .then(function(verify_key){
    let mailOptions = {
      from:'"ScoreHoard" <donotreply@scorehoard.com>',
      to: login,
      subject: 'Confirmation Email',
      text: 'Thank you',
      html: `<p>Thank you for registering an account with ScoreHoard. May we fulfill your ScoreHoarding needs! Please click <a href="http://scorehoard.com/verify/${verify_key}">here</a> to verify your account with us!</p>`
    };
    let stored_pass = create_hash(password);
    let query = 'SELECT login FROM company WHERE login = $1';
    db.none(query, login)
    .then(function(){
      let query = 'INSERT INTO company VALUES (DEFAULT, $1, $2, $3, $4, DEFAULT, $5) RETURNING *'
      db.one(query, [login, stored_pass, pub, name, verify_key])  // returns new company
        .then(function(company){
          request.session.company = company;
          request.session.user = name;
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.error(error);
            }
            console.log('Message send: ', info.messageId, info.response);
          });
          response.redirect('/console');
        })
        .catch(function(err){next(err)})
      })
    .catch(function(err){
      if (err.name == "QueryResultError"){
        context = {title: "Create Account", fail: true}
        response.render('create_account.hbs', context)
      }
      else {
        console.error(err);
      };
    })
  })
  .catch(function(err){
    if (err.name == "QueryResultError"){
      context = {title: "Create Account", fail: true}
      response.render('create_account.hbs', context)
    }
    else {
      console.error(err);
    };
  })
});


app.get('/dev/login/', function(req, res) {
  res.render('login.hbs');
});

app.post('/dev/login/', function(request, response) {
    //////////////////////////////////////////////////////////////
   // If user has requested a password reset, send reset email //
  //////////////////////////////////////////////////////////////
  if(request.body.reset_pass) {
    // console.log('reset')
    // let email = request.body.login;
    // let query = 'SELECT * FROM user WHERE login = $1';
    // db.one(query, email)
    // .then(function(result){
    //   let login = result.login;
    //   let key = result.verify_key;
    //   let mailOptions = {
    //   from:'"Uplifting Quotes" <donotreply@scorehoard.com>',
    //   to: email,
    //   subject: 'Uplifting Quotes - Password Reset',
    //   text: 'Password Reset',
    //   html: `To reset your password, go to https://scorehoard.com/reset/${key}`
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     return console.error(error);
    //   }
    //   console.log('Message send: ', info.messageId, info.response);
    //   });
    //   response.redirect('/');
    // })
    // .catch(function(err){
    //     if (err.name == "QueryResultError" && err.code == "0"){ // if no account in database
    //       context = {title: "Login", invalid: true, body_class: "blue"}
    //       response.render('login.hbs', context)
    //     }
    //     else {
    //       console.error(err);
    //     };
    // })
    ///////////////////////////////////////////////
   // Otherwise, authenticate login credentials //
  ///////////////////////////////////////////////
  } else {
    const login = request.body.login;
    const password = request.body.password;
    const devQuery = `SELECT * FROM developer
                      WHERE email ILIKE ${login}`;
    db.one(devQuery, login)
    .then(developer => {
      return {
        authorized: auth.checkPass(developer.password, password),
        developer: developer
      };
    })
    .then(loginObj => {
      // If password check successful, redirect user to the dev panel.
      if(loginObj.authorized) {
        request.session.user = login;
        response.redirect('/');
      // If password check unsuccessful, display an alert to the user.
      } else if(!loginObj.authorized) {
        context = {title: 'Uplifting Quotes: Login', fail: true}
        response.render('login.hbs', context)
      }
    })
    .catch(err => {
      // If login credentials do not exist in database, display an
      // alert to the user
      if(err.name === "QueryResultError" && err.code == "0") {
        context = {title: 'Uplifting Quotes: Login', invalid: true}
        response.render('login.hbs', context)
      }
      else {
        console.error(err.stack);
      };
    })
  }
})

app.get('/dev/logout', function(request, response, next) {
  // Destroy session cookie
  request.session.destroy(err => {
    if(err) { console.error('Something went wrong: '+ err); }
    response.redirect('/');
  });
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
