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
  b6UTxQ: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
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

//get short url and long url from urlDatabase and make a new db. for current user
const currentUserDatabase = (allUserData, currentUser) => {
  const newDatabase = {};
  const dataBaseKeys = Object.keys(allUserData);
  for (const key of dataBaseKeys) {
    if (currentUser && currentUser.id === allUserData[key].userID) {
      newDatabase[key] = allUserData[key].longURL;
    }
  }
  return newDatabase;
};

app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_id']];

  const templateVars = { urls: currentUserDatabase(urlDatabase, user), user };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { user };

  // Only logged in user can shorten urls
  user ? res.render('urls_new', templateVars) : res.redirect('/login');
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies['user_id']];
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
  const user = users[req.cookies['user_id']];

  const body = req.body;
  const randomString = generateRandomString();

  //Add new long url and user_id to database
  urlDatabase[randomString] = { longURL: body.longURL, userID: user.id };

  //Only logged in users can send post req.
  user ? res.redirect(`/urls/${randomString}`) : res.status(400).send('400 error!!!!');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const key = req.params.shortURL;

  delete urlDatabase[key];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  //edit and update urls matching id
  urlDatabase[req.params.id].longURL = req.body.update;
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
