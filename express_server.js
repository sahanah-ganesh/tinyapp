const express = require('express');
const app = express()

const PORT = 8080;

const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['keys'],
  maxAge: 24 * 60 * 60 * 1000 }));


app.set('view engine', 'ejs');

// ____________________________________________________________________________

const urlDatabase = {
  b6UTxQ: { longURL:'https://www.tsn.ca',
            userID: 'aJ48lW' },

  i3BoGr: { longURL:'https://www.google.ca',
            userID: 'aJ48lW' }
};

const users = {
'aJ48lW': { id:       'aJ48lW',
            email:    'a@b.com',
            password:  bcrypt.hashSync("123", 10)   },

 'user2RandomID': { id:       'user2RandomID',
                    email:    'b@c',
                    password: 'abc' }
};

// ____________________________________________________________________________

function generateRandomString() {

  let string = Math.random().toString(36).substring(7);
  return string;
}

function hasher(password) {

  let hashPass = bcrypt.hashSync(password, 10);
  return hashPass;
}

function urlsForUser(id) {

  let urls = {};

  for (let urlID in urlDatabase) {
    let shortURL = urlDatabase[urlID].shortURL;

    if (urlDatabase[urlID].userID === id) {
      urls[shortURL] = urlDatabase[urlID];
    }
  }
  return urls;
};

// ____________________________________________________________________________

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// ____________________________________________________________________________

// GET /

// if user is logged in:
// (Minor) redirect to /urls
// if user is not logged in:
// (Minor) redirect to /login

app.get('/', (req, res) => {

  if(!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');

});


// GET /urls

// if user is logged in:
// returns HTML with:
// the site header (see Display Requirements above)
// a list (or table) of URLs the user has created, each list item containing:
// a short URL
// the short URL's matching long URL
// an edit button which makes a GET request to /urls/:id
// a delete button which makes a POST request to /urls/:id/delete
// (Minor) a link to "Create a New Short Link" which makes a GET request to /urls/new
// if user is not logged in:
// returns HTML with a relevant error message

app.get('/urls', (req, res) => {

  if (!req.session.user_id) {
    return res.status(400).send('Please login or register');
  }

  let user = users[req.session.user_id];

  if (user !== undefined) {

    let templateVars = {'user': user,
                        'urls': urlsForUser(req.session.user_id) };

    res.render('urls_index', templateVars);
  }
});


// GET /urls/new

// if user is logged in:
// returns HTML with:
// the site header (see Display Requirements above)
// a form which contains:
// a text input field for the original (long) URL
// a submit button which makes a POST request to /urls
// if user is not logged in:
// redirects to the /login page


app.get('/urls/new', (req, res) => {

  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  let user = users[req.session.user_id];

  let templateVars = { 'user': user };

  res.render('urls_new', templateVars);
});


// GET /urls/:id

// if user is logged in and owns the URL for the given ID:
// returns HTML with:
// the site header (see Display Requirements above)
// the short URL (for the given ID)
// a form which contains:
// the corresponding long URL
// an update button which makes a POST request to /urls/:id
// if a URL for the given ID does not exist:
// (Minor) returns HTML with a relevant error message
// if user is not logged in:
// returns HTML with a relevant error message
// if user is logged it but does not own the URL with the given ID:
// returns HTML with a relevant error message

app.get('/urls/:id', (req, res) => {

  if(!req.session.user_id) {
    return res.status(401).send('Please login or register');
  }

  let shortURL = req.params.id;

  if(!urlDatabase[shortURL]) {
    return res.status(404).send('TinyURL does not exist');
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send('TinyURL does not belong to you');
  }

  let longURL = urlDatabase[shortURL].longURL;

  let templateVars = { 'shortURL': shortURL,
                       'longURL':  longURL,
                       'userID':   req.session.user_id};

  res.render('urls_show', templateVars);
});


// GET /u/:id

// if URL for the given ID exists:
// redirects to the corresponding long URL
// if URL for the given ID does not exist:
// (Minor) returns HTML with a relevant error message

app.get('/u/:id', (req, res) => {

  let shortURL = req.params.id;

  if(!urlDatabase[shortURL]) {
    return res.status(404).send('TinyURL does not exist!');
  }

  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// POST /urls

// if user is logged in:
// generates a short URL, saves it, and associates it with the user
// redirects to /urls/:id, where :id matches the ID of the newly saved URL
// if user is not logged in:
// (Minor) returns HTML with a relevant error message

app.post('/urls', (req, res) => {

  if(!req.session.user_id) {
    return res.status(401).send('Please login');
  }

  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = {'longURL': longURL,
                           'userID':  users[req.session.user_id].id}

  res.redirect(`/urls/${shortURL}`);
});


// POST /urls/:id

// if user is logged in and owns the URL for the given ID:
// updates the URL
// redirects to /urls
// if user is not logged in:
// (Minor) returns HTML with a relevant error message
// if user is logged it but does not own the URL for the given ID:
// (Minor) returns HTML with a relevant error message

app.post('/urls/:id', (req, res) => {

  if(!req.session.user_id) {
    return res.status(401).send('Please login or register');
  }

  let shortURL = req.params.id;

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send('TinyURL does not belong to you');
  }

  const updateURL = req.body.updated;

  urlDatabase[shortURL].longURL. = updateURL;

  res.redirect('/urls');

});


// POST /urls/:id/delete
// if user is logged in and owns the URL for the given ID:
// deletes the URL
// redirects to /urls
// if user is not logged in:
// (Minor) returns HTML with a relevant error message
// if user is logged it but does not own the URL for the given ID:
// (Minor) returns HTML with a relevant error message

app.post('/urls/:id/delete', (req, res) => {

  if(!req.session.user_id) {
    return res.status(401).send('Please login or register');
  }

  let shortURL = req.params.id;

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send('TinyURL does not belong to you');
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


// GET /login

// if user is logged in:
// (Minor) redirects to /urls
// if user is not logged in:
// returns HTML with:
// a form which contains:
// input fields for email and password
// submit button that makes a POST request to /login

app.get('/login', (req, res) => {

  if (!req.session.user_id) {
    return res.render('urls_login');
  }

  res.redirect('/urls');

});


// GET /register

// if user is logged in:
// (Minor) redirects to /urls
// if user is not logged in:
// returns HTML with:
// a form which contains:
// input fields for email and password
// a register button that makes a POST request to /register

app.get('/register', (req, res) => {

  if(!req.session.user_id) {
    return res.render('urls_register');
  }
  res.redirect('/urls');

});


app.post('/login', (req, res) => {

  let inputEmail = req.body.email;
  let inputPass = req.body.password;
  let hashPass = hasher(inputPass);
  let foundUser = findUserByEmail(inputEmail, users);

  if (!foundUser && !bcrypt.compareSync(inputPass, hashPass)) {
    return res.status(403).send('Email or password incorrect');
  }

  req.session.user_id = 'user_id';
  res.redirect('/urls');

});


app.post('/register', (req, res) => {

  let inputEmail = req.body.email;
  let inputPassword = req.body.password;

  if (!inputEmail || !inputPassword) {
    return res.status(400).send('Please enter email or password');
  }

  let foundUser = findUserByEmail(inputEmail, users);

  if (!foundUser) {
    return res.status(400).send('Email already exists');
  }

  req.session.user_id = generateRandomString();

  let hashPass = hasher(inputPassword);

  users['req.session.user_id'] = {'id':       req.session.user_id,
                                  'email':    inputEmail,
                                  'password': hashPass }

  res.cookie('user_id', req.session.user_id);
  res.redirect('/urls');

});


app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.session.user_id);
  res.redirect('/login');
});






