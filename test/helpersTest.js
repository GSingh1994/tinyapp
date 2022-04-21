const { assert } = require('chai');
const { isRegistered, generateRandomString, currentUserDatabase } = require('../helpers');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('isRegistered', function () {
  it('should return a user with valid email', function () {
    const user = isRegistered(testUsers, 'user@example.com');
    const expectedUserID = 'userRandomID';
    assert.strictEqual(user, expectedUserID);
  });
  it('should return false for invalid email', function () {
    const user = isRegistered(testUsers, 'invalid@example.com');
    assert.strictEqual(user, false);
  });
});
