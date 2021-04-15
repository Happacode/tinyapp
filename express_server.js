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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () =>  {
  return Math.random().toString(36).substring(2, 8);
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const tinyString = generateRandomString();
  const longString = req.body.longURL;
  urlDatabase[tinyString] = longString;
  res.statusCode = 200;
  res.redirect(`/urls/${tinyString}`);         // Respond with 'Ok' (we will replace this)
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
  // console.log("Username:", req.body.username);
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.get(`/urls/:shortURL`, (req, res) => {
  const templateVars = {longURL: urlDatabase[req.params.shortURL], shortURL: req.params.shortURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});