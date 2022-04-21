const isRegistered = (usersObj, givenEmail) => {
  for (const user in usersObj) {
    if (usersObj[user].email === givenEmail) {
      return user;
    }
  }
  return false;
};

module.exports = { isRegistered };
