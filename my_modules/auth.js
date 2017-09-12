/**************************************************************************
                      Authentication & Authorization
***************************************************************************/

////////////////////////////
// Includes functions for:
// - Hashing Passwords
// - Checking Passwords
// - Generating Verification Keys & API Keys
// - Retrieving User Data

const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const keygen = require("apikeygen").apikey;

function generateApiKey(db) {
  let apiKey = keygen(50);
  let query = `SELECT count(api_key)
               FROM app
               WHERE api_key = '${apiKey}';`;
  let p = new Promise((resolve, reject) => {
    db.query(query)
    .then(count => {
      if(count[0].count == 0) {
        resolve(apiKey);
      } else {
        generateApiKey()
        .then(key => {
          resolve(key);
        })
        .catch(err => {
          reject(err);
        });
      }
    })
    .catch(err => {
      reject(err);
    });
  });
  return p;
}

function generateVerKey(db) {
  const verKey = keygen(40);
  const query = `SELECT count(verify_key)
                 FROM developer
                 WHERE verify_key = '${verKey}';`;
  let p = new Promise((resolve, reject) => {
    db.query(query)
    .then(count => {
      if(count[0].count == 0){
        resolve(verKey);
      }
      else{
        generateVerKey()
         .then(key => {
           resolve(key);
         })
         .catch(err => {
           reject(err);
         });
      }
    })
    .catch(err => {
      reject(err);
    });
  });
  return p;
}

// Password creation, hashing, and verification
function createHash(password) {
  const salt = crypto.randomBytes(20).toString('hex');
  const key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, 'sha256');
  const hash = key.toString('hex');
  const stored_pass = `pbkdf2_sha256$36000$${salt}$${hash}`;
  return stored_pass;
}

function checkPass(stored_pass, password) {
  const pass_parts = stored_pass.split('$');
  const key = pbkdf2.pbkdf2Sync(
    password,
    pass_parts[2],
    parseInt(pass_parts[1]),
    256,
    'sha256'
  );
  const hash = key.toString('hex');
  if (hash === pass_parts[3]) {
    return true;
  }
  return false;
}

function authorizeUser(account, res) {
  if(account === null) {
    res.redirect('/dev/welcome');
    return;
  }
  ///// TODO: Fix weird comma at end of email
  account.email = account.email.replace(',','');
  context = {
    account: account,
    title: 'Uplifting Quotes: Developer Panel'
  };
  return context;
}

function getUserApps(db, context) {
  context['verified'] = true;
  const appQuery = `SELECT * FROM app
                    WHERE user_id = ${context.account.id} AND active
                    ORDER BY name;`;

  let p = new Promise((resolve, reject) => {
    db.query(appQuery)
    .then(apps => {
      apps.forEach(app => {
        if(app.api_key !== null) {
          app['key_present'] = true;
        }
      });
      context['apps'] = apps;
      context['numKeys'] = apps.length;
      resolve(context);
    })
    .catch(err => {
      reject(err);
    });
  });
  return p;
}

///// TODO: Limit free API requests if server traffic grows heavy
function checkLimit(db, params) {
  const limitCheck = `SELECT user_id
                      FROM app
                      WHERE api_key = '${params.key}'`;

  let p = new Promise((resolve, reject) => {
    db.one(limitCheck)
    .then(result => {
      if(result) {
        resolve(result);
      }
    })
    .catch(err => {
      reject(err);
    })
  });
  return p;
}

exports.checkPass = checkPass;
exports.createHash = createHash;
exports.generateVerKey = generateVerKey;
exports.generateApiKey = generateApiKey;
exports.authorizeUser = authorizeUser;
exports.getUserApps = getUserApps;
exports.checkLimit = checkLimit;
