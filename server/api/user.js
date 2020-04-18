const assert = require("assert");

const { withRandomOffset } = require("../util.js");
const { USER } = require("./constants.js");
const { RETRIEVAL_POINTS_PER_MS } = require("../../constants.js");

module.exports.userInformation = (db, { username }) => {
  assert(typeof username === "string", "`username` is a string");
  return db
    .collection(USER)
    .findOne({ username })
    .then(({ password: _password, ...rest }) => rest);
};

module.exports.authenticateUser = (db, { username, password }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(typeof password === "string", "`password` is a string");
  return db
    .collection(USER)
    .findOne({ username, password })
    .then(result => {
      if (!result) throw { error: "NO_USERNAME_OR_NO_BAD_PASSWORD" };
      return { username };
    });
};

module.exports.newUser = (db, { username, password }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(typeof password === "string", "`password` is a string");
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

module.exports.updatePoints = (db, { username, updateDate }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(updateDate instanceof Date, "`updateDate` should be a date");
  const col = db.collection(USER);
  return col
    .findOne({ username })
    .then(({ points, lastRetrievePoints, _id }) => {
      const msDiff = updateDate.valueOf() - lastRetrievePoints.valueOf();
      const pointsDelta = withRandomOffset(RETRIEVAL_POINTS_PER_MS * msDiff);
      return col.findOneAndUpdate(
        { _id },
        {
          $set: {
            points: points + pointsDelta,
            lastRetrievePoints: updateDate
          }
        },
        {
          returnOriginal: false,
          projection: {
            points: true,
            lastRetrievePoints: true
          }
        }
      );
    });
};
