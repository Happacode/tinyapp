const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "monkey"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined if non-existent email', function() {
    const user = getUserByEmail(testUsers, "milkshake@example.com");
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});