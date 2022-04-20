const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

let users = {};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const isRegistered = (usersObj, givenEmail) => {
  for (const user in usersObj) {
    if (usersObj[user].email === givenEmail) {
      return user;
    }
  }
  return false;
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { urls: urlDatabase, user };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/404', (req, res) => {
  res.send('<html><body><h1>404 Page not found</h1></body></html>');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  longURL ? res.redirect(longURL) : res.redirect('/404');
});

app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']];
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
  users[id] = { id, email, password };

  // store user id cookie
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const body = req.body;
  const randomString = generateRandomString();
  urlDatabase[randomString] = body.longURL;
  res.redirect(`/urls/${randomString}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.update;
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

  // check if password is correct
  if (password !== users[currentUser].password) {
    return res.status(403).send('Password doesnot match');
  }

  res.cookie('user_id', users[currentUser].id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
