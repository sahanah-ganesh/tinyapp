function generateRandomString() {
  var newURL = Math.random().toString(36).substring(7);
  return newURL;
}

var express = require("express");
var app = express();
var PORT = 8080;

var cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const templateVars = {username: undefined};
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['username'] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL,
                       longURL: urlDatabase[shortURL],
                       username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let urlKey = generateRandomString();
  urlDatabase[urlKey] = req.body.longURL;
  res.redirect(`/urls/${urlKey}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  cookieParser.JSONCookie(username);
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  cookieParser.JSONCookie(username);
  res.clearCookie("username", username);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const updateURL = req.body.updated;
  urlDatabase[req.params.shortURL] = updateURL;
  res.redirect("/urls/");
});


// app.post("/register", (req, res) => {
//   const newUser = req.body.username;

// })

// urlDatabase[urlKey] = req.body.longURL;
