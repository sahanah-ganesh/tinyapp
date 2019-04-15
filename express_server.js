const express = require('express');
const app = express()

const PORT = 8080;

const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['keys']
  maxAge: 24 * 60 * 60 * 1000 }));


app.set('view engine', 'ejs');


const urlDatabase = {
  b6UTxQ: { longURL:'https://www.tsn.ca',
            userID: 'aJ48lW' },

  i3BoGr: { longURL:'https://www.google.ca',
            userID: 'aJ48lW' }
};

const users = {
  'aJ48lW': { id:       'aJ48lW',
              email:    'a@b.com',
              password: bcrypt.hashSync("123", 10)   },

 'user2RandomID': { id:       'user2RandomID',
                    email:    'b@c',
                    password: 'abc' }
};

function generateRandomString() {
  let string = Math.random().toString(36).substring(7);
  return string;
}

function findUserByEmail(email, users) {
  for (let userID in users) {
    if (email === users[userID].email) {
      return userID;
    }
  }
  return false;
}

function hasher(password) {
  let hashPass = bcrypt.hashSync(password, 10);
  return hashPass;
}

function urlsForUser(id) {
  let userURLS = {};

  for (let urls in urlDatabase) {
    let shortURL = urlDatabase[urls].shortURL;

    if (urlDatabase[urls].userID === id) {
      userURLS[shortURL] = urlDatabase[urls];
    }
  }
  return userURLS;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get('/', (req, res) => {

  if(!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('urls');

});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/urls', (req, res) => {

  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  let shortURL = req.params.shortURL;
  let inputEmail = req.params.email;
  let foundUser = findUserByEmail(inputEmail, users);
  let email = foundUser.email;

  let templateVars = { 'user_id': req.session.user_id,
                       'user':    users,
                       'urls':    urlsForUser(req.session.user_id),
                       'email':   email };

  res.render('urls_index', templateVars);

});


app.get('/urls/new', (req, res) => {

  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  let inputEmail = req.params.email;

  let templateVars = { 'userID': req.session.user_id,
                        urls:    urlsForUser(req.session.user_id),
                       'email':  inputEmail };

  res.render('urls_new', templateVars);
});


app.get('/urls/:id', (req, res) => {

  let user_id = req.session.user_id;
  let shortURL = req.params.shortURL;

  if(!user_id) {
    return res.status(401).send('Please login or register');
  }

  if(!urlDatabase[shortURL]) {
    return res.status(400).send('TinyURL does not exist');
  }

  if (user_id !== urlDatabase[shortURL].userID) {
    res.redirect('/login');
  }

  let email = req.params.email;
  let longURL = req.params.longURL;

  let templateVars = { 'shortURL': shortURL,
                       'longURL':  longURL,
                       'email':    email,
                       'userID':   user_id};

  res.render('urls_show', templateVars);
});


app.get('/u/:id', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
  //send error if tiny url doesn't exist
});

app.post('/urls', (req, res) => {

  if(!req.session.user_id) {
    return res.status(401).send('Please login');
  }

  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = {'longURL':  longURL,
                           'shortURL': shortURL,
                           'userID':   req.session.user_id}

  res.redirect(`/urls/${shortURL}`);
});


app.post('/urls/:id', (req, res) => {
  const updateURL = req.body.updated;
  let short = req.params.shortURL;
  urlDatabase[short]['longURL'] = updateURL;
  res.redirect('/urls');
});


app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.get('/login', (req, res) => {

  if (!req.session.user_id) {
    return res.render('urls_login');
  }
  res.redirect('/urls');

});


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






