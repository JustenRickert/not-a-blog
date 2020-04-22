export const POPULATION_CAPACITY_INITIAL = 1000;
export const POPULATION_CAPACITY_PER_POINT = 1 / 10e3;
export const POPULATION_GROWTH_PERCENTAGE = 0.001;
export const POPULATION_GROWTH_TIMEOUT = 30e3;

export const POINTS_PER_MS = 1 / 1e3;
export const POINTS_UPDATE_TIMEOUT = 10e3;

export const INDUSTRIES_STUB = {
  agriculture: {
    allocation: 0,
    supply: 0
  },
  baking: {
    allocation: 0,
    supply: 0
  }
  // handTool: {
  //   allocation: 0,
  //   supply: 0
  // },
  // textiles: {
  //   allocation: 0,
  //   supply: 0
  // }
};

export const INDUSTRIES_EMPLOYMENT_TIMEOUT = {
  agriculture: 3e3,
  baking: 6e3,
  handTool: 10e3,
  textiles: 12e3
};

export const INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE = {
  agriculture: 0.02,
  baking: 0.01,
  handTool: 0.005,
  textiles: 0.001
};

/**
 * @remarks
 * A bit dense: If the value is a number, then it is an atomic resource, meaning
 * it depends on nothing but having allocation in the industry. If the value is
 * an object, then `value` is it's production rate. Other keys in object should
 * be names of other industries, whose `supply`s drop according the product of
 * the first industry's allocation and the second' industry's value below.
 *
 */
export const INDUSTRIES_UPDATE_SUPPLY_RATE = {
  agriculture: 0.1,
  baking: {
    unit: 0.1,
    agriculture: 3
  }
  // handTool: {
  //   value: 0.1
  // },
  // textiles: {
  //   value: 0.1
  // }
};

export const INDUSTRIES_UPDATE_SUPPLY_TIMEOUT = 15e3;
