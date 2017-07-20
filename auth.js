const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const keygen = require("apikeygen").apikey;

function generateApiKey(db) {
  let apiKey = keygen(50);
  var p = new Promise(function (resolve, reject) {
    db.query('SELECT count(api_key) FROM app WHERE api_key = $1', apiKey)
    .then(function(count){
      if(count[0].count == 0){
        resolve(apiKey);
      }
      else{
        generateApiKey()
         .then(function (key) {
           resolve(key);
         })
         .catch(function (err) {
           reject(err);
         });
      }
    })
    .catch(function(err){
      reject(err);
    });
  });
  return p;
}

function generateVerKey(db) {
  let verKey = keygen(40);
  var p = new Promise(function (resolve, reject) {
    db.query('SELECT count(verify_key) FROM developer WHERE verify_key = $1', verKey)
    .then(function(count){
      if(count[0].count == 0){
        resolve(verKey);
      }
      else{
        generateVerKey()
         .then(function (key) {
           resolve(key);
         })
         .catch(function (err) {
           reject(err);
         });
      }
    })
    .catch(function(err){
      reject(err);
    });
  });
  return p;
}

// Password creation, hashing, and verification
function createHash (password) {
  var salt = crypto.randomBytes(20).toString('hex');
  var key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, 'sha256');
  var hash = key.toString('hex');
  var stored_pass = `pbkdf2_sha256$36000$${salt}$${hash}`;
  return stored_pass;
}

function checkPass (stored_pass, password){
  var pass_parts = stored_pass.split('$');
  var key = pbkdf2.pbkdf2Sync(
    password,
    pass_parts[2],
    parseInt(pass_parts[1]),
    256,
    'sha256'
  );

  var hash = key.toString('hex');
  if (hash === pass_parts[3]) {
    return true;
  }
  else {
    console.log('Passwords do not match')
  }
  return false;
}

exports.checkPass = checkPass;
exports.createHash = createHash;
exports.generateVerKey = generateVerKey;
exports.generateApiKey = generateApiKey;
