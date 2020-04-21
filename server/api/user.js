const assert = require("assert");
const { ObjectId } = require("mongodb");

const { range, withRandomOffset } = require("../util.js");
const { USER_COLLECTION, POPULATION_INITIAL } = require("./constants.js");
const {
  POINTS_PER_MS,
  POPULATION_CAPACITY_INITIAL,
  POPULATION_CAPACITY_PER_POINT,
  POPULATION_GROWTH_PERCENTAGE,
  POPULATION_GROWTH_SECONDS
} = require("../../constants.js");

module.exports.authenticateUser = (db, { username, password }) => {
  assert(typeof username === "string", "`username` is a string");
  assert(typeof password === "string", "`password` is a string");
  return db
    .collection(USER_COLLECTION)
    .findOne({ username, password })
    .then(result => {
      if (!result) throw { error: "NO_USERNAME_OR_NO_BAD_PASSWORD" };
      return result._id;
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
      lastUpdatePointsDate: new Date(),
      lastPopulationChangeDate: new Date()
    });
  });
};

// AUTHENTICATED ROUTES

module.exports.userInformation = (db, { id }) => {
  assert(typeof id === "string", "`id` is a string");
  console.log("WHAT", id);
  return db
    .collection(USER_COLLECTION)
    .findOne({ _id: ObjectId(id) }, { projection: { _id: false } })
    .then(({ password: _password, ...rest }) => rest);
};

module.exports.updatePopulation = (db, { id, updateDate }) => {
  assert(typeof id === "string", "`id` is a string");
  assert(updateDate instanceof Date, "`updateDate` is a Date");
  const col = db.collection(USER_COLLECTION);
  return col
    .findOne({ _id: ObjectId(id) })
    .then(({ points, population, lastPopulationChangeDate, _id }) => {
      const capacity =
        POPULATION_CAPACITY_INITIAL + points * POPULATION_CAPACITY_PER_POINT;
      const secondsDiff =
        (updateDate.valueOf() - lastPopulationChangeDate.valueOf()) / 1000;
      // :shaka: https://en.wikipedia.org/wiki/Logistic_function#In_ecology:_modeling_population_growth
      const newPopulation =
        capacity /
        (1 +
          ((capacity - population) / population) *
            Math.E ** (-POPULATION_GROWTH_PERCENTAGE * secondsDiff));
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
            _id: false,
            population: true,
            lastPopulationChangeDate: true
          }
        }
      );
    });
};

module.exports.updatePoints = (db, { id, updateDate }) => {
  assert(typeof id === "string", "`id` is a string");
  assert(updateDate instanceof Date, "`updateDate` should be a date");
  const col = db.collection(USER_COLLECTION);
  return col
    .findOne({ _id: ObjectId(id) })
    .then(({ points, lastUpdatePointsDate, _id }) => {
      const msDiff = updateDate.valueOf() - lastUpdatePointsDate.valueOf();
      const pointsDelta = withRandomOffset(POINTS_PER_MS * msDiff);
      return col.findOneAndUpdate(
        { _id },
        {
          $set: {
            points: points + pointsDelta,
            lastUpdatePointsDate: updateDate
          }
        },
        {
          returnOriginal: false,
          projection: {
            _id: false,
            points: true,
            lastUpdatePointsDate: true
          }
        }
      );
    });
};
