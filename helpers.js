// Helper functions

// require bcrypt for userPasswordVerify() function
const bcrypt = require('bcrypt');

// *  URL Database Object *
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  s9m5xK: { longURL: "http://www.google.com", userID: "user2RandomID" }
};

// *  User Database Object  *
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("monkey", 10)
  }
};

// email checking global function
const getUserByEmail = function(users, email) {
  
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return undefined;
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

module.exports = { getUserByEmail, userPasswordVerify, generateRandomString, urlsForUser, urlDatabase, users };