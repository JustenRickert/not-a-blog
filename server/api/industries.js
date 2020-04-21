const assert = require("assert");
const { ObjectId } = require("mongodb");

const { INDUSTRIES_COLLECTION, USER_COLLECTION } = require("./constants.js");
const {
  INDUSTRIES_STUB,
  INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE,
  INDUSTRIES_UPDATE_SUPPLY_RATE
} = require("../../constants.js");
const { range, withRandomMinusOffset } = require("../util.js");

const industryNames = Object.keys(INDUSTRIES_STUB);

module.exports.industriesInformation = (db, { id }) => {
  assert(typeof id === "string", "`id` is a string");
  const col = db.collection(INDUSTRIES_COLLECTION);
  return col
    .findOne({ _id: ObjectId(id) }, { projection: { _id: false } })
    .then(async result => {
      if (!result)
        result = await col
          .insertOne({
            _id: ObjectId(id),
            ...Object.entries(INDUSTRIES_STUB).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: {
                  ...value,
                  lastEmploymentUpdateDate: new Date(),
                  lastUpdateSupplyDate: new Date()
                }
              }),
              {}
            )
          })
          .then(result => result.ops[0])
          // `insertOne` doesn't take `projection`? what a fucking joke db
          .then(({ _id, ...results }) => results);
      return result;
    });
};

module.exports.employIndustry = async (
  db,
  { id, updateDate, industryName }
) => {
  assert(typeof id === "string", "`id` is be a string");
  assert(updateDate instanceof Date, "`updateDate` is be a Date");
  assert(
    industryNames.includes(industryName),
    "`industryName` should be one of the available industries"
  );
  const [population, industries] = await Promise.all([
    db
      .collection(USER_COLLECTION)
      .findOne({ _id: ObjectId(id) }, { projection: { population: true } })
      .then(({ population }) => Math.floor(population)),
    db
      .collection(INDUSTRIES_COLLECTION)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: false } })
  ]);
  const totalAllocated = Object.values(industries).reduce(
    (totalAllocated, { allocation }) => totalAllocated + allocation,
    0
  );
  const totalUnallocated = population - totalAllocated;
  const newlyEmployed = Math.ceil(
    withRandomMinusOffset(
      INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE[industryName] * totalUnallocated
    )
  );
  return db
    .collection(INDUSTRIES_COLLECTION)
    .findOneAndUpdate(
      {
        _id: ObjectId(id)
      },
      {
        $set: {
          [[industryName, "lastEmploymentUpdateDate"].join(".")]: updateDate
        },
        $inc: {
          [[industryName, "allocation"].join(".")]: newlyEmployed
        }
      },
      {
        returnOriginal: false,
        projection: {
          _id: false,
          [industryName]: true
        }
      }
    )
    .then(result => result.value[industryName]);
};

module.exports.updateSupply = (db, { id, updateDate, industryName }) => {
  assert(typeof id === "string", "`id` should a string");
  assert(updateDate instanceof Date, "`updateDate` should be a Date");
  assert(
    industryNames.includes(industryName),
    "`industryName` should be one of the available industries"
  );
  const col = db.collection(INDUSTRIES_COLLECTION);
  return col
    .findOne({ _id: ObjectId(id) })
    .then(
      ({
        _id,
        [industryName]: { supply, allocation, lastUpdateSupplyDate }
      }) => {
        const rate = INDUSTRIES_UPDATE_SUPPLY_RATE[industryName];
        const secondsDiff =
          (updateDate.getTime() - lastUpdateSupplyDate.getTime()) / 1000;
        const delta = allocation * rate * secondsDiff;
        return col
          .findOneAndUpdate(
            {
              _id
            },
            {
              $set: {
                [[industryName, "lastUpdateSupplyDate"].join(".")]: updateDate
              },
              $inc: {
                [[industryName, "supply"].join(".")]: delta
              }
            },
            {
              returnOriginal: false,
              projection: {
                _id: false,
                [industryName]: true
              }
            }
          )
          .then(result => result.value[industryName]);
      }
    );
};
