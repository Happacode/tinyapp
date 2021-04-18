// Helper functions

// require bcrypt for userPasswordVerify() function
const bcrypt = require('bcrypt');

// email checking global function
const getUserByEmail = function(users, email) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return null;
};

// password checking global function
const userPasswordVerify = function(users, email, password) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      if (bcrypt.compareSync(password, users[user]["password"])) {
        return user;
      }
    }
  }
  return null;
};

//  generator for six digit alphanumeric string
const generateRandomString = () =>  {
  return Math.random().toString(36).substring(2, 8);
};

// storing secure shorturls for unique user
const urlsForUser = function(userId, urlDatabase) {
  let userStoredUrls = {};

  for (let key in urlDatabase) {
    if (userId === urlDatabase[key].userID) {
      userStoredUrls[key] = { longURL: urlDatabase[key].longURL, userId };
    }
  }
  return userStoredUrls;
};

module.exports = { getUserByEmail, userPasswordVerify, generateRandomString, urlsForUser };