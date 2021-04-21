const express = require("express");
const morgan = require("morgan");
const app = express();
const {getUserByEmail, userPasswordVerify, generateRandomString, urlsForUser, urlDatabase, users} = require("./helpers");

const bcrypt = require("bcrypt");

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(morgan("dev"));

const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["secret", "keys"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// * Route Get

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  
  if (!userId) {
    res.redirect("/login");
  }

  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  
  if (userId) {
    return res.redirect("/urls");
  }
  
  const templateVars = {
    userId
  };

  res.render("register", templateVars);
});
// Only registered users can login
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  
  if (userId) {
    return res.redirect("/urls");
  }
  
  const templateVars = {
    userId
  };

  res.render("login", templateVars);
});
// Only logged in users can view tinyUrls
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let userEmail;
  let urls = urlDatabase;

  if (!userId) {
    res.status(400).send("Please login to view URLs.");
  }
  userEmail = users[userId]["email"];
  urls = urlsForUser(userId, urlDatabase);
   
  const templateVars = {
    urls,
    userId,
    userEmail
  };

  res.render("urls_index", templateVars);
});
// Create tinyUrls on url_new page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  
  if (!userId) {
    res.status(400).redirect("/login");
  }

  const userEmail = users[userId]["email"];
  const templateVars = {
    urls: urlDatabase,
    userEmail,
    userId
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // Only shows Urls for unique user
  const shortURL = req.params.shortURL;
  const urlData = urlDatabase[shortURL];
  
  if (!urlData) {
    return res.status(400).send("Sorry, invalid shortURL.");
  }
  
  const userId = req.session.user_id;
  
  
  if (!userId) {
    return res.status(400).send("Access denied, please login.");
  }

  const myURLs = urlsForUser(userId, urlDatabase);
  if (!myURLs[shortURL]) {
    return res.status(400).send("Access denied to edit shortURL.");
  }
  
  const updatedURL = urlDatabase[shortURL].longURL;
  let userEmail;

  if (userId) {
    userEmail = users[userId]["email"];
  }
  
  const templateVars = { shortURL: req.params.shortURL, longURL: updatedURL, userId, userEmail };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// * Post requests

app.post("/urls", (req, res) => {
  const tinyString = generateRandomString();
  
  if (req.session['user_id']) {
  // created hard coded "http://" to longURL strings submitted
    let longString = req.body.longURL;
    if (!(longString.startsWith('http://') || longString.startsWith('https://'))) {
      longString = "http://" + longString;
    }
    urlDatabase[tinyString] = {longURL: longString, userID: req.session.user_id};
  }

  res.statusCode = 200;
  res.redirect(`/urls/${tinyString}`);
});

app.post("/urls/:shortURL", (req, res) => {
  //check if URL belongs to user's list then they can update
  const shortURL = req.params.shortURL;
  
  if (!req.session['user_id']) {
    return res.status(400).redirect("/");
  }
  const myURLs = urlsForUser(req.session["user_id"], urlDatabase);
  
  if (!myURLs[shortURL]) {
    return res.status(400).send("Access denied to edit shortURL.");
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  
  if (urlsForUser(req.session["user_id"])) {
    delete (urlDatabase[req.params.shortURL]);
  }
  res.redirect("/urls");
});
// login submission
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  let userVerified = getUserByEmail(users, userEmail);
  let userPassword = req.body.password;
  
  if (!getUserByEmail(users, userEmail)) {
    return res.status(403).send("Email cannot be found.");
  }
  
  if (!userPasswordVerify(users, userEmail, userPassword)) {
    return res.status(403).send("Password is incorrect.");
  }
  req.session["user_id"] = userVerified;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});
// registration submission
app.post("/register", (req, res) => {
  let newId = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  
  if (userEmail === "" || userPassword === "") {
    return res.status(400).send("Incorrect email or password.");
  }

  if (getUserByEmail(users, userEmail)) {
    return res.status(400).send("User already registered.");
  }
  // bcrypt used to hash unique user id
  let hashedPassword = bcrypt.hashSync(userPassword, 10);
  
  const newUser = {
    id: newId,
    email: userEmail,
    password: hashedPassword
  };

  users[newId] = newUser;
  req.session["user_id"] = newId;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});