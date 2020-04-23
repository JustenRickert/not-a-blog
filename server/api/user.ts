import assert from "assert";
import { ObjectId } from "mongodb";

import { withRandomOffset } from "../util";
import { USER_COLLECTION, POPULATION_INITIAL } from "./constants";
import {
  POINTS_PER_MS,
  POPULATION_CAPACITY_INITIAL,
  POPULATION_CAPACITY_PER_POINT,
  POPULATION_GROWTH_PERCENTAGE
} from "../../constants";

export function authenticateUser(db, { username, password }) {
  assert(typeof username === "string", "`username` is a string");
  assert(typeof password === "string", "`password` is a string");
  return db
    .collection(USER_COLLECTION)
    .findOne({ username, password })
    .then(result => {
      if (!result) throw { error: "NO_USERNAME_OR_NO_BAD_PASSWORD" };
      return result._id;
    });
}

export function newUser(db, { username, password }) {
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
}

// AUTHENTICATED ROUTES

export function userInformation(db, { id }) {
  assert(typeof id === "string", "`id` is a string");
  return db
    .collection(USER_COLLECTION)
    .findOne({ _id: new ObjectId(id) }, { projection: { _id: false } })
    .then(({ password: _password, ...rest }) => rest);
}

export function updatePopulation(db, { id, updateDate }) {
  assert(typeof id === "string", "`id` is a string");
  assert(updateDate instanceof Date, "`updateDate` is a Date");
  const col = db.collection(USER_COLLECTION);
  return col
    .findOne({ _id: new ObjectId(id) })
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
}

export function updatePoints(db, { id, updateDate }) {
  assert(typeof id === "string", "`id` is a string");
  assert(updateDate instanceof Date, "`updateDate` should be a date");
  const col = db.collection(USER_COLLECTION);
  return col
    .findOne({ _id: new ObjectId(id) })
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
}
