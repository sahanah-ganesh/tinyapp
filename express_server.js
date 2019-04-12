function generateRandomString() {
  var newURL = Math.random().toString(36).substring(7);
  return newURL;
}

function findUserByEmail(email, users) {
  for (var user in users) {
    if (email === users[user]["email"]) {
      return true;
    }
  }
  return false;
}

function findUserByPassword(password, users) {
  for (var user in users) {
    if (password === users[user]["password"]) {
      return true;
    }
  }
  return false;
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
  res.render("urls_register");
});

app.get("/login", (req, res) => {

  res.render("urls_login");
});

app.get("/urls", (req, res) => {

  let user_id = req.cookies["user_id"];
  console.log("user_id:", user_id);

  let user = users[user_id];
  let email = null;

  if (user_id) {
    email = [user_id]["email"];
  }
  console.log("user object:", users);
  let templateVars = { urls:  urlDatabase,
                       user:  user  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  let user_id = req.cookies["user_id"];
  let user = users[user_id];

  let templateVars = { user_id: user_id,
                       user:    user };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  let shortURL = req.params.shortURL;

  let templateVars = { shortURL: shortURL,
                       longURL:  urlDatabase[shortURL],
                       user:     user };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/register", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Please enter username or password");

  } else if (!findUserByEmail(email, users)) {
    let user_id = generateRandomString();
    user = {id:       user_id,
            email:    email,
            password: password }
    users[user_id] = user;
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  } else {
    res.status(400).send("I don't know?")
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let urlKey = generateRandomString();
  urlDatabase[urlKey] = req.body.longURL;
  res.redirect(`/urls/${urlKey}`);
});

app.post("/login", (req, res) => {
  email = req.body.email;
  password = req.body.password;

  if (findUserByEmail(email, users) && findUserByPassword(password, users)) {
    let user_id = users[user][req.cookie["user_id"]];
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.end("Unknown");
  }
});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  res.clearCookie("user_id", user_id);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const updateURL = req.body.updated;
  urlDatabase[req.params.shortURL] = updateURL;
  res.redirect("/urls");
});

