const assert = require("assert");
const { ObjectId } = require("mongodb");

const { INDUSTRIES_COLLECTION } = require("./constants.js");
const { INDUSTRIES_STUB } = require("../../constants.js");

module.exports.industriesInformation = (db, { id }) => {
  assert(typeof id === "string", "`id` is a string");
  const col = db.collection(INDUSTRIES_COLLECTION);
  return col.findOne({ _id: ObjectId(id) }).then(async result => {
    if (!result)
      result = await col.insertOne({ _id: ObjectId(id), ...INDUSTRIES_STUB });
    return result;
  });
};
