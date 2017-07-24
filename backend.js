const express = require('express');
const app = express();
const promise = require('bluebird');
const body_parser = require('body-parser');
const axios = require('axios');
/*********** DB-Related *************/
const pgp = require('pg-promise')({ promiseLib: promise });
const update_db = require('./my_modules/update_db');
const query_db = require('./my_modules/query_db')
/*********** Login-Related ***********/
const session = require('express-session');
const nodemailer = require('nodemailer');
const auth = require('./my_modules/auth');

/************************************************************************
                        Database Configuration
*************************************************************************/
const db = pgp(process.env.DATABASE || {
  host: 'localhost',
  port: 9004,
  database: 'Quotes',
  user: 'postgres',
});

/*************************************************************************
                        E-mail Configuration
*************************************************************************/
const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'],
  port: 465,
  secure: true,
  auth:{
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASSWORD']
  }
});

/*************************************************************************
                            App Configuration
**************************************************************************/
app.set('view engine', 'hbs');
app.use(body_parser.urlencoded({extended: false}));
app.use('/static', express.static('static'));
//////// TODO: Set up HTTPS for secure sessions
app.use(session({
  secret: process.env.SECRET_KEY || 'dev',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 600000}
}));

/*************************************************************************
                                API Requests
**************************************************************************/
app.get('/api/:key', (req, res, next) => {
  let params = {
    key: req.params.key,
    numQuotes: req.query.numQuotes || 1,
    random: req.query.random,
    author: req.query.author,
    category: req.query.category
  }

  auth.checkLimit(db, params)
  .then((result) => {
    db.query(query_db.constructQuery(req, params))
    .then(quotes => {
      // Multiple categories constitute separate rows in the join table.
      // combineQueryResults consolidates categories onto a single quote
      // object before returning the data to the user.
      let response = query_db.combineQueryResults(quotes, params);
      res.json(response);
    })
    .catch(err => {
      next(err);
    });
  })
  .catch(err => {
    if(err.name === "QueryResultError") {
      res.json(`Something went wrong with your request. Double check your API
        key and parameters, then try again.`);
    } else {
      console.error(err.stack);
    }
  });
});

/*****************************************************************************
                                  App Routes
******************************************************************************/
app.get('/', (req, res) => {
  res.render('index.hbs', {title: 'Home'});
});

app.get('/search', (req, res) => {
  res.render('search.hbs', {title: 'Search'});
})

app.get('/dev/welcome', (req, res) => {
  res.render('dev_info.hbs', {title: 'Welcome'});
});

app.get('/dev/guide', (req, res) => {
  res.render('api_guide.hbs', {title: 'Getting Started'});
});

  /////////////////////////////////
 // Developer Tools & Resources //
/////////////////////////////////
// Includes:
// - rendering dev panel
// - adding apps
// - deleting (deactivating) apps
// - generating API keys
app.get('/dev/', (req, res, next) => {
  let account = req.session.user || null;
  context = auth.authorizeUser(account, res);
  if(context.account.verified) {
    auth.getUserApps(db, context)
    .then((context) => {
      res.render('dev_panel.hbs', context);
    })
  } else {
    res.render('dev_panel.hbs', context);
  }
});

app.post('/dev', (req, res, next) => {
  const userWantsApiKey = req.body.apiKeyGenerate;
  const userWantsToDeleteApp = req.body.deleteApp;
  const userWantsToCreateApp = req.body.createApp;
  let account = req.session.user || null;

  if(account === null) {
    res.redirect('/dev/login');
    return;
  } else if(account.verified) {
    context['verified'] = true;
  }

  if(userWantsApiKey) {
    const id = req.session.user.id;
    const appId = req.body.appId;
    auth.generateApiKey(db)
    .then(key => {
      const query = `UPDATE app SET api_key = '${key}'
                     WHERE id = ${appId}
                     RETURNING name, url`;
      db.one(query)
      .then(obj => {
        res.redirect('/dev');
      })
      .catch(err => {
        next(err);
      })
    })
    .catch(err => {
      next(err);
      console.error(err.stack);
    });
  } else if(userWantsToDeleteApp) {
    const appId = req.body.appId;
    const query = `UPDATE app SET active = FALSE
                   WHERE id = ${appId};`;
    db.query(query)
      .then (() => {
        if(account === null) {
          res.redirect('/dev/login');
          return;
        }
        res.redirect('/dev');
      })
      .catch(err => {
        console.error(err.stack);
        res.redirect('/dev');
      });

  } else if(userWantsToCreateApp) {
    const name = req.body.appName;
    const url = req.body.appUrl;
    const query = `INSERT INTO app (user_id, name, url)
                   VALUES (${account.id}, '${name}', '${url}')
                   RETURNING id`;
    let key = 'Pending';

    db.any(query)
    .then(() => {
      if (account === null) {
        res.redirect('/dev/login');
        return;
      }
      res.redirect('/dev')
    })
    .catch(err => {
      console.error(err.stack)
    });
  }

  });

  ///////////////////////////
 // Create Account, Login //
///////////////////////////
app.get('/dev/register', (req, res) => {
  res.render('register.hbs')
});

app.post('/dev/register', (req, res, next) => {
  ////// TODO: Figure out where that weird comma is coming from
  const login = req.body.login;
  const password = req.body.password;

  auth.generateVerKey(db)
  .then(verKey => {
    const key = verKey;
    const mailOptions = {
      from:'"Uplift Dev Server" <aspen.hollyer@gmail.com>',
      to: 'aspen.hollyer@gmail.com',
      subject: 'Confirmation Email',
      text: 'Thank you',
      html: `To verify your Uplifting Quotes account, go to http://localhost:9001/dev/account/verify/${verKey}`
    };
    const stored_pass = auth.createHash(password);
    let query = `SELECT * FROM developer
                 WHERE email ILIKE '${login}';`;
    db.none(query)
    .then(() => {
      query = `INSERT INTO developer
               VALUES (DEFAULT, '${login}', DEFAULT, '${stored_pass}', '${key}')
               RETURNING *;`;
      db.one(query)  // returns new developer
      .then(developer => {
        req.session.user = developer;
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.error(error);
          }
          console.log('Message send: ', info.messageId, info.response);
        });
        res.redirect('/dev');
      })
      .catch(err => {
        next(err);
      });
    })
    .catch(err => {
      if (err.name === "QueryResultError") {
        res.render('register.hbs', {title: "Create Account", fail: true});
      }
      else {
        console.error(err.stack);
      }
    });
  })
  .catch(err => {
    if (err.name === "QueryResultError"){
      res.render('register.hbs', {title: "Create Account", fail: true});
    }
    else {
      console.error(err.stack);
    }
  });
});


app.get('/dev/login/', (req, res) => {
  res.render('login.hbs');
});

app.post('/dev/login/', (req, res) => {
    //////////////////////////////////////////////////////////////
   // If user has requested a password reset, send reset email //
  //////////////////////////////////////////////////////////////
  if(req.body.reset_pass) {
    let email = req.body.login;
    let query = `SELECT * FROM developer
                 WHERE email ILIKE '${email}'`;
    db.one(query, email)
    .then(function(result){
      let login = result.login;
      let key = result.verify_key;
      let mailOptions = {
      from:'"Uplifting Quotes" <donotreply@scorehoard.com>',
      to: 'aspen.hollyer@gmail.com',
      subject: 'Uplifting Quotes - Password Reset',
      text: 'Password Reset',
      html: `To reset your password, go to http://localhost:9001/dev/reset/${key}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error(error);
      }
      console.log('Message send: ', info.messageId, info.res);
      });
      res.redirect('/');
    })
    .catch(function(err){
        // If database contains no account matching the given email, redirect
        // user to login page with "no account" message.
        if (err.name == "QueryResultError" && err.code == "0") {
          res.render('login.hbs', {title: 'Login', invalid: true});
        } else {
          console.error(err);
        };
    })
    ///////////////////////////////////////////////
   // Otherwise, authenticate login credentials //
  ///////////////////////////////////////////////
  } else {
    const email = req.body.login;
    const password = req.body.password;
    const query = `SELECT * FROM developer
                   WHERE email ILIKE '${email}'`;
    db.one(query)
    .then(developer => {
      return {
        authorized: auth.checkPass(developer.password, password),
        developer: developer
      };
    })
    .then(loginObj => {
      // If password check successful, redirect user to the dev panel.
      if(loginObj.authorized) {
        req.session.user = loginObj.developer;
        res.redirect('/dev');
      // If password check unsuccessful, display an alert to the user.
      } else if(!loginObj.authorized) {
        context = {title: 'Uplifting Quotes: Login', fail: true};
        res.render('login.hbs', context);
      }
    })
    .catch(err => {
      // If login credentials do not exist in database, display an
      // alert to the user
      if(err.name === "QueryResultError" && err.code == "0") {
        context = {title: 'Uplifting Quotes: Login', invalid: true}
        res.render('login.hbs', context)
      }
      else {
        console.error(err.stack);
      };
    })
  }
})

app.get('/dev/logout', (req, res, next) => {
  req.session.destroy(err => {
    if(err) {
      console.error('Something went wrong: '+ err);
    }
    res.redirect('/');
  });
})

app.get('/dev/account/verify/:key', (req, res, next) => {
  let key = req.params.key;
  let query = `UPDATE developer SET verified = TRUE
               WHERE verify_key = ${key}`;
  db.none(query)
  .then(() => {
    query = `SELECT * FROM developer
             WHERE verify_key = ${key}`;
    key = req.params.key;
    db.one(query)
    .then(result => {
      const login = result.login;
      const developer = result;
      req.session.user = developer;
      context = {verified: true, justVerified: true};
      res.redirect('/dev')
    })
    .catch(err => {
      console.error(err.stack);
    });
  })
  .catch(err => {
    console.error(err.stack);
  });
});


/************************ Database Update Form Routes ************************/
app.get('/add_quote/', (req, res) => {
  update_db.getFormData(req, res, db);
})

app.post('/add_quote/', (req, res, next) => {
  req.body.quote = req.body.quote.replace(/'/g,"''");
  // If form input includes a new author, update the database
  // accordingly before inserting the new quote.
  if(req.body.newAuthor !== "") {
    req.body.newAuthor = req.body.newAuthor.replace(/'/g,"''");
    const authorInsert = `INSERT INTO author (name)
                          VALUES ('${req.body.newAuthor}');`;
    const authorLookUp = 'SELECT id FROM author ORDER BY id DESC LIMIT 1;'
    // Insert the author into the database
    db.query(authorInsert)
    .then(() => {
      return db.query(authorLookUp);
    })
    // Update the request body to reflect the newly added author's ID
    .then(queryResult => {
      req.body.authorId = queryResult[0].id;
    })
    // Add the quote (with foreign key to author's ID) to the database
    .then(() => {
      update_db.insertQuote(req, res, db);
    })
    .catch(err => {
      next(err);
    });
  } else {
    update_db.insertQuote(req, res, db);
  }

});

/********************************* Server ************************************/
const PORT = process.env.PORT || 9001;
app.listen(9001, function() {
  console.log(`Listening on port ${PORT}`);
});
