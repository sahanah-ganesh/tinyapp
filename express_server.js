function generateRandomString() {
  var newURL = Math.random().toString(36).substring(7);
  return newURL;
}

function findUserByEmail(email, users) {
  for (var user_id in users) {
    if (email === users[user_id]["email"]) {
      return users[user_id];
    }
  }
  return false;
}

function findUserByPassword(password, users) {
  for (var user_id in users) {
    if (password === users[user_id]["password"]) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let userURLS = {};

  for (var shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userID"] === id) {
      userURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLS;
};

var express = require("express");
var app = express();
var PORT = 8080;

var cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca",
            userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca",
            userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id:"aJ48lW",
    email: "a@b.com",
    password: "abc"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "b@c",
    password: "123"
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

  let user_id = req.cookies.user_id;
  let shortURL = req.params.shortURL;

  if (!user_id) {
    return res.redirect("/login");
  }

  let email = users[user_id]["email"];

  let templateVars = { "user_id": user_id,
                        urls:     urlsForUser(user_id),
                       "email":   email };

  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {

  let user_id = req.cookies.user_id;

  if (!user_id) {
    return res.redirect("/login");
  }

    let email = users[user_id]["email"];

    let templateVars = { "user_id": user_id,
                         urls:      urlsForUser(user_id),
                         "email":   email };

    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  let user_id = req.cookies.user_id;
  let shortURL = req.params.shortURL;

  if(!urlDatabase[shortURL]) {
    return res.status(400).send("TinyURL does not exist");
  }

  if(!user_id) {
    return res.status(401).send("Please login or register");
  }

  if (user_id !== urlDatabase[shortURL].userID) {
    res.redirect("/login");
  }

  let email = users[user_id].email;

  let templateVars = { "shortURL": shortURL,
                       longURL:    urlDatabase[shortURL].longURL,
                       "email":    email,
                       "user_id": user_id};

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
  //send error if tiny url doesn't exist
});

app.post("/register", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(401).send("Please enter email or password");
  }

  if (findUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }

    let user_id = generateRandomString();

    user = {"id":       user_id,
            "email":    email,
            "password": password }

    users[user_id] = user;
    cookieParser.JSONCookie(user_id);
    res.cookie("user_id", user_id);
    res.redirect("/urls");

});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = {"longURL": longURL,
                         "userID": req.cookies.user_id}

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;
  let foundUser = findUserByEmail(email, users);
  let foundPass = findUserByPassword(password, users);

  if (foundUser && foundPass) {
    let user_id = foundUser.id;
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Username or password incorrect");
  }
});

app.post("/logout", (req, res) => {
  let user_id = req.cookies.user_id;
  res.clearCookie("user_id", user_id);
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  const updateURL = req.body.updated;
  let short = req.params.shortURL;
  urlDatabase[short]["longURL"] = updateURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});



