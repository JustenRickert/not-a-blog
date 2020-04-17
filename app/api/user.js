const assert = require("assert");

const { USER } = require("./constants.js");

module.exports.authenticateUser = (db, { username, password }) => {
  assert(typeof username === "string", "username is a string");
  assert(typeof password === "string", "password is a string");
  return db
    .collection(USER)
    .findOne({ username, password })
    .then(result => {
      if (!result) throw { error: "NO_USERNAME_OR_NO_BAD_PASSWORD" };
      return { username };
    });
};

module.exports.newUser = (db, { username, password }) => {
  assert(typeof username === "string", "username is a string");
  assert(typeof password === "string", "password is a string");
  const collection = db.collection(USER);
  return collection.findOne({ username }).then(result => {
    if (result) throw { error: "USERNAME_EXISTS_ALREADY" };
    return collection.insertOne({
      username,
      password,
      points: 0,
      createdDate: new Date(),
      lastRetrievePoints: new Date()
    });
  });
};

module.exports.updatePoints = db => {};
