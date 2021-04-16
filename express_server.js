const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(morgan("dev"));

const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// *  URL Database Object *
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  s9m5xK: { longURL: "http://www.google.com", userID: "userRandomID" }
};

// *  User Database Object  *
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "monkey"
  }
};


const generateRandomString = () =>  {
  return Math.random().toString(36).substring(2, 8);
};

// * Get

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    userId
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    userId
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const userEmail = users[userId]["email"];
  const templateVars = {
    urls: urlDatabase,
    userEmail,
    userId
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    res.redirect("/login");
  }
  const userEmail = users[userId]["email"];
  const templateVars = {
    urls: urlDatabase,
    userEmail,
    userId
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/show", (req, res) => {
  const userId = req.cookies["user_id"];
  const userEmail = users[userId]["email"];
  const templateVars = {
    urls: urlDatabase,
    userEmail,
    userId
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateUsername = req.cookies["user_id"];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, urls: urlDatabase, username: templateUsername };
  res.render("urls_show", templateVars);
});

app.get(`/urls/:shortURL`, (req, res) => {
  const templateVars = {longURL: urlDatabase[req.params.shortURL], shortURL: req.params.shortURL,};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// * Post

app.post("/urls", (req, res) => {
  const tinyString = generateRandomString();
  const longString = req.body.longURL;
  urlDatabase[tinyString] = longString;
  res.statusCode = 200;
  res.redirect(`/urls/${tinyString}`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const editUrl = req.params.shortURL;
  res.redirect(`/urls/${editUrl}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete (urlDatabase[req.params.shortURL]);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userVerified = userEmailVerify(users, userEmail);
  let userPassword = req.body.password;
  if (!userEmailVerify(users, userEmail)) {
    return res.status(403).send("Email cannot be found.");
  }
  
  if (!userPasswordVerify(users, userPassword)) {
    return res.status(403).send("Password is incorrect.");
  }
  
  res.cookie("user_id", userVerified);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  let userEmail = req.body.email;
  let userVerified = userEmailVerify(users, userEmail);
  res.clearCookie("user_id", userVerified);
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  let newId = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  // console.log("userVerify", userEmail, userPassword);
  // * If the e-mail or password are empty strings, send back a response with the 400 status code
  if (userEmail === "" || userPassword === "") {
    return res.status(400).send("Incorrect email or password.");
  }

  if (userEmailVerify(users, userEmail)) {
    return res.status(400).send("User already registered.");
  }

  const newUser = {
    id: newId,
    email: userEmail,
    password: userPassword
  };
  users[newId] = newUser;
  console.log("users:", users);
  res.cookie("user_id", newId);
  res.redirect("/urls");
});

// email checking global function
const userEmailVerify = function(users, email) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return null;
};
// password checking global function
const userPasswordVerify = function(users, password) {
  for (let user in users) {
    if (users[user]["password"] === password) {
      return user;
    }
  }
  return null;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});