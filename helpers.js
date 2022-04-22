const isRegistered = (usersObj, givenEmail) => {
  for (const user in usersObj) {
    if (usersObj[user].email === givenEmail) {
      return user;
    }
  }
  return false;
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//get short url and long url from urlDatabase and make a new db. for current user
const currentUserDatabase = (allUserData, currentUser) => {
  const newDatabase = {};
  const dataBaseKeys = Object.keys(allUserData);
  for (const key of dataBaseKeys) {
    if (currentUser && currentUser.id === allUserData[key].userID) {
      newDatabase[key] = { longURL: allUserData[key].longURL, userID: allUserData[key].userID };
    }
  }
  return newDatabase;
};

module.exports = { isRegistered, generateRandomString, currentUserDatabase };
