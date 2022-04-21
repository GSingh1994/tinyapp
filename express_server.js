const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { isRegistered, generateRandomString, currentUserDatabase } = require('./helpers');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['secretkey'],
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW',
  },
};

let users = {};

app.get('/', (req, res) => {
  const user = users[req.session.user_id];
  user ? res.redirect('/urls') : res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { urls: currentUserDatabase(urlDatabase, user), user };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };

  // Only logged in user can shorten urls
  user ? res.render('urls_new', templateVars) : res.redirect('/login');
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const currentURL = currentUserDatabase(urlDatabase, user);
  const templateVars = { shortURL: shortURL, longURL: currentURL[shortURL], user };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/404', (req, res) => {
  res.send('<html><body><h1>404 Page not found</h1></body></html>');
});

app.get('/u/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  const longURL = urlDatabase[req.params.shortURL].longURL;
  longURL && user ? res.redirect(longURL) : res.redirect('/404');
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render('user_new', templateVars);
});

app.get('/login', (req, res) => {
  res.render('user_login');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  // check if email or pswd are empty
  !email || !password ? res.status(400).send('Username or password is empty') : null;
  // check if email is already taken
  if (isRegistered(users, email)) {
    return res.status(400).send('email is already registered');
  }

  const id = generateRandomString();

  //hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, password: hashedPassword };

  // store user id cookie
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const user = users[req.session.user_id];

  const body = req.body;
  const randomString = generateRandomString();

  //Add new long url and user_id to database
  urlDatabase[randomString] = { longURL: body.longURL, userID: user.id };

  //Only logged in users can send post req.
  user ? res.redirect(`/urls/${randomString}`) : res.status(400).send('400 error!!!!');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const key = req.params.shortURL;
  const user = users[req.session.user_id];
  const currentURL = currentUserDatabase(urlDatabase, user);

  //delete only if cprrect user is logged in
  if (currentURL[key]) {
    delete urlDatabase[key];
    res.redirect('/urls');
  } else {
    res.status(401).send('unauthorised user');
  }
});

app.post('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  //edit and update urls matching id if the user is logged in
  user ? (urlDatabase[req.params.id].longURL = req.body.update) : null;
  res.redirect(`/urls/${req.params.id}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  //store value of user if it exist in users object
  const currentUser = isRegistered(users, email);

  //check if user is registered
  if (!currentUser) {
    return res.status(403).send('This email is not registered');
  }
  //check hash password
  const isHashPasswordMatch = bcrypt.compareSync(password, users[currentUser].password);
  // check if password is correct
  if (!isHashPasswordMatch) {
    return res.status(403).send('Password doesnot match');
  }

  req.session.user_id = users[currentUser].id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
