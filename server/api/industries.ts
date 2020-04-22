import assert from "assert";
import { ObjectId } from "mongodb";

import { INDUSTRIES_COLLECTION, USER_COLLECTION } from "./constants";
import {
  INDUSTRIES_STUB,
  INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE,
  INDUSTRIES_UPDATE_SUPPLY_RATE
} from "../../constants";
import { keys, withRandomMinusOffset } from "../util";
import { IndustryNames } from "../../types";

const industryNames = keys(INDUSTRIES_STUB);

export function industriesInformation(db, { id }: { id: string }) {
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
}

export async function employIndustry(
  db,
  {
    id,
    updateDate,
    industryName
  }: {
    id: string;
    updateDate: Date;
    industryName: IndustryNames;
  }
) {
  const [population, industries] = await Promise.all([
    db
      .collection(USER_COLLECTION)
      .findOne({ _id: ObjectId(id) }, { projection: { population: true } })
      .then(({ population }) => Math.floor(population)),
    db
      .collection(INDUSTRIES_COLLECTION)
      .findOne({ _id: ObjectId(id) }, { projection: { _id: false } })
  ]);
  const totalAllocated = Object.values(industries).reduce<number>(
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
}

export function updateSupply(
  db,
  {
    id,
    updateDate,
    industryName
  }: {
    id: string;
    updateDate: Date;
    industryName: IndustryNames;
  }
) {
  const col = db.collection(INDUSTRIES_COLLECTION);
  return col
    .findOne({ _id: ObjectId(id) })
    .then(
      ({
        _id,
        [industryName]: { allocation, lastUpdateSupplyDate },
        ...industries
      }) => {
        const rate = INDUSTRIES_UPDATE_SUPPLY_RATE[industryName];
        const secondsDiff =
          (updateDate.getTime() - lastUpdateSupplyDate.getTime()) / 1000;
        if (typeof rate === "number") {
          const delta = allocation * rate * secondsDiff;
          console.log("UPDATE", {
            industryName,
            delta,
            allocation,
            rate,
            secondsDiff
          });
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
            .then(result => result.value);
        } else {
          // TODO
          const { value, ...productCosts } = rate;
          const maxDelta = allocation * value * secondsDiff;
          const subtractions = Object.entries(productCosts).reduce(
            (subtractions, [otherIndustryName, cost]) => ({
              ...subtractions,
              [otherIndustryName]: cost * maxDelta
            }),
            {} as Record<IndustryNames, number>
          );
          console.log("Requirements necessary", {
            value,
            productCosts,
            maxDelta,
            subtractions
          });
        }
      }
    );
}
