import { IndustryName } from "./types";

export const POPULATION_CAPACITY_INITIAL = 1000;
export const POPULATION_CAPACITY_PER_POINT = 1 / 10e3;
export const POPULATION_GROWTH_PERCENTAGE = 0.001;
export const POPULATION_GROWTH_TIMEOUT = 30e3;

export const POINTS_PER_MS = 1 / 1e3;
export const POINTS_UPDATE_TIMEOUT = 10e3;

const INDUSTRY_STUB = {
  allocation: 0,
  supply: 0
};

export const INDUSTRIES_STUB = {
  agriculture: INDUSTRY_STUB,
  baking: INDUSTRY_STUB,
  forestry: INDUSTRY_STUB,
  handTool: INDUSTRY_STUB,
  mining: INDUSTRY_STUB,
  textiles: INDUSTRY_STUB
};

export const INDUSTRY_LABELS: Record<IndustryName, string> = {
  agriculture: "Farming and junk",
  baking: "Cooking and stuff",
  forestry: "Nurturing trees and things",
  handTool: "Making shit",
  mining: "Getting things out of the ground",
  textiles: "Wearing clothes"
};

export const INDUSTRIES_EMPLOYMENT_TIMEOUT: Record<IndustryName, number> = {
  agriculture: 30e3,
  baking: 60e3,
  forestry: 150e3,
  handTool: 200e3,
  mining: 100e3,
  textiles: 120e3
};

export const INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE: Record<
  IndustryName,
  number
> = {
  agriculture: 0.02,
  baking: 0.01,
  forestry: 0.003,
  handTool: 0.005,
  mining: 0.002,
  textiles: 0.001
};

/**
 * TODO: Could probably write a test to validate that everything is actually
 * attainable. Would be a cool recursive function
 *
 * @remarks
 *
 * A bit dense: If the value is a number, then it is an atomic resource, meaning
 * it depends on nothing but having allocation in the industry. `number` is the
 * supply made per allocation per time period (production rate).
 *
 * If the value is an object, then `value` is it's production rate. Other keys
 * in object should be names of other industries, whose `supply`s drop according
 * the product of the first industry's allocation and the second' industry's
 * value below.
 *
 */
export const INDUSTRIES_UPDATE_SUPPLY_RATE: Record<
  IndustryName,
  number | ({ unit: number } & Partial<Record<IndustryName, number>>)
> = {
  agriculture: 0.5,
  baking: {
    unit: 0.1,
    agriculture: 3
  },
  forestry: {
    unit: 0.1,
    agriculture: 1,
    mining: 1,
    handTool: 1
  },
  handTool: {
    unit: 0.05,
    agriculture: 0.1,
    mining: 5
  },
  mining: 0.01,
  textiles: {
    unit: 0.01,
    agriculture: 0.5,
    handTool: 1
  }
};

export const INDUSTRIES_UPDATE_SUPPLY_TIMEOUT = 15e3;
