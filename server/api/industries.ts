import assert from "assert";
import { ObjectId, Db } from "mongodb";

import { INDUSTRIES_COLLECTION, USER_COLLECTION } from "./constants";
import {
  INDUSTRIES_STUB,
  INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE,
  INDUSTRIES_UPDATE_SUPPLY_RATE
} from "../../constants";
import { entries, keys, withRandomMinusOffset } from "../util";
import { IndustryName, Industry, Industries } from "../../types";

const industryNames = keys(INDUSTRIES_STUB);

export function industriesInformation(db: Db, { id }: { id: string }) {
  const col = db.collection(INDUSTRIES_COLLECTION);
  return col
    .findOne({ _id: new ObjectId(id) }, { projection: { _id: false } })
    .then(async result => {
      if (!result)
        result = await col
          .insertOne({
            _id: new ObjectId(id),
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
          // `insertOne` doesn't take `projection`? T_T
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
    industryName: IndustryName;
  }
) {
  const [population, industries] = await Promise.all([
    db
      .collection(USER_COLLECTION)
      .findOne({ _id: new ObjectId(id) }, { projection: { population: true } })
      .then(({ population }) => Math.floor(population)),
    db
      .collection(INDUSTRIES_COLLECTION)
      .findOne({ _id: new ObjectId(id) }, { projection: { _id: false } })
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
  return db.collection(INDUSTRIES_COLLECTION).findOneAndUpdate(
    {
      _id: new ObjectId(id)
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
  );
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
    industryName: IndustryName;
  }
) {
  const col = db.collection(INDUSTRIES_COLLECTION);
  return col
    .findOne({ _id: new ObjectId(id) })
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
          return col.findOneAndUpdate(
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
          );
        } else {
          const { unit, ...productCosts } = rate;
          const maxDelta = allocation * unit * secondsDiff;
          const maxSubtractions = entries(productCosts).reduce(
            (subtractions, [otherIndustryName, costPerUnit]) => ({
              ...subtractions,
              [otherIndustryName]: maxDelta * costPerUnit
            }),
            {} as Record<IndustryName, number>
          );
          const deltaRatio = entries(maxSubtractions).reduce(
            (deltaRatio, [otherIndustryName, supplySubtraction]) => {
              const otherIndustry = (industries as Industries)[
                otherIndustryName
              ];
              return otherIndustry.supply < supplySubtraction
                ? otherIndustry.supply / supplySubtraction
                : deltaRatio;
            },
            1
          );
          return col.findOneAndUpdate(
            {
              _id
            },
            {
              $set: {
                [[industryName, "lastUpdateSupplyDate"].join(".")]: updateDate,
                ...Object.entries(maxSubtractions).reduce(
                  (subtractions, [otherIndustryName, maxSubtraction]) => {
                    console.log({
                      industry: { allocation },
                      other: industries[otherIndustryName],
                      deltaRatio,
                      maxSubtraction
                    });
                    assert(
                      industries[otherIndustryName].supply -
                        deltaRatio * maxSubtraction >=
                        0 || deltaRatio * maxSubtraction < 1,
                      "Doing the below correction shouldn't affect numbers too irregularly"
                    );
                    return {
                      ...subtractions,
                      /**
                       * Need to do the `Math.max` thing here because otherwise we
                       * get rounding errors on the `deltaRatio` calculation that
                       * causes negative supplies. JavaScript :shrug:
                       */
                      [[otherIndustryName, "supply"].join(".")]: Math.max(
                        0,
                        industries[otherIndustryName].supply -
                          deltaRatio * maxSubtraction
                      )
                    };
                  },
                  {}
                )
              },
              $inc: {
                [[industryName, "supply"].join(".")]: deltaRatio * maxDelta
              }
            },
            {
              returnOriginal: false,
              projection: {
                _id: false,
                [industryName]: true,
                ...Object.keys(maxSubtractions).reduce(
                  (acc, key) => ({ ...acc, [key]: true }),
                  {}
                )
              }
            }
          );
        }
      }
    );
}
