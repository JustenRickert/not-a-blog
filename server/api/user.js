const assert = require("assert");

const { range, withRandomOffset } = require("../util.js");
const { USER_COLLECTION, POPULATION_INITIAL } = require("./constants.js");
const {
  RETRIEVAL_POINTS_PER_MS,
  POPULATION_CAPACITY_INITIAL,
  POPULATION_CAPACITY_PER_POINT,
  POPULATION_GROWTH_PERCENTAGE,
  POPULATION_GROWTH_SECONDS
} = require("../../constants.js");

module.exports.userInformation = (db, { username }) => {
  assert(typeof username === "string", "`username` is a string");
  return db
    .collection(USER_COLLECTION)
    .findOne({ username })
    .then(({ password: _password, ...rest }) => rest);
};

module.exports.authenticateUser = (db, { username, password }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(typeof password === "string", "`password` is a string");
  return db
    .collection(USER_COLLECTION)
    .findOne({ username, password })
    .then(result => {
      if (!result) throw { error: "NO_USERNAME_OR_NO_BAD_PASSWORD" };
      return { username };
    });
};

module.exports.newUser = (db, { username, password }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(typeof password === "string", "`password` is a string");
  const collection = db.collection(USER_COLLECTION);
  return collection.findOne({ username }).then(result => {
    if (result) throw { error: "USERNAME_EXISTS_ALREADY" };
    return collection.insertOne({
      username,
      password,
      points: 0,
      population: POPULATION_INITIAL,
      createdDate: new Date(),
      lastRetrievePoints: new Date(),
      lastPopulationChangeDate: new Date()
    });
  });
};

module.exports.updatePopulation = (db, { username, updateDate }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(updateDate instanceof Date, "`updateDate` is a Date");
  const col = db.collection(USER_COLLECTION);
  return col
    .findOne({ username })
    .then(({ points, population, lastPopulationChangeDate, _id }) => {
      const capacity =
        POPULATION_CAPACITY_INITIAL + points * POPULATION_CAPACITY_PER_POINT;
      const secondsDiff =
        (updateDate.valueOf() - lastPopulationChangeDate.valueOf()) / 1000;
      const secondsRemainder = secondsDiff % POPULATION_GROWTH_SECONDS;
      const newPopulation = range(
        Math.floor(secondsDiff / POPULATION_GROWTH_SECONDS)
      ).reduce(
        newPopulation =>
          newPopulation +
          POPULATION_GROWTH_PERCENTAGE *
            newPopulation *
            (1 - newPopulation / capacity),
        population
      );
      updateDate.setSeconds(updateDate.getSeconds() + secondsRemainder);
      return col.findOneAndUpdate(
        { _id },
        {
          $set: {
            population: newPopulation,
            lastPopulationChangeDate: updateDate
          }
        },
        {
          returnOriginal: false,
          projection: {
            population: true,
            lastPopulationChangeDate: true
          }
        }
      );
    });
};

module.exports.updatePoints = (db, { username, updateDate }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(updateDate instanceof Date, "`updateDate` should be a date");
  const col = db.collection(USER_COLLECTION);
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
