module.exports.POPULATION_CAPACITY_INITIAL = 1000;
module.exports.POPULATION_CAPACITY_PER_POINT = 1 / 10e3;
module.exports.POPULATION_GROWTH_PERCENTAGE = 0.001;
module.exports.POPULATION_GROWTH_SECONDS = populationGrowthSeconds = 30;
module.exports.POPULATION_GROWTH_TIMEOUT = 1e3 * populationGrowthSeconds;

module.exports.POINTS_PER_MS = 1 / 1e3;
module.exports.POINTS_UPDATE_TIMEOUT = 10e3;

module.exports.INDUSTRIES_STUB = {
  baking: {
    allocation: 0,
    supply: 0
  },
  handTool: {
    allocation: 0,
    supply: 0
  }
};

module.exports.INDUSTRIES_EMPLOYMENT_TIMEOUT = {
  baking: 3e3,
  handTool: 5e3
};

module.exports.INDUSTRIES_EMPLOYMENT_GROWTH_PERCENTAGE = {
  baking: 0.01,
  handTool: 0.005
};

module.exports.INDUSTRIES_UPDATE_SUPPLY_RATE = {
  baking: 0.2,
  handTool: 0.1
};

module.exports.INDUSTRIES_UPDATE_SUPPLY_TIMEOUT = 15e3;

module.exports.INDUSTRIES_PRODUCTION = {
  baking: 1,
  handTool: 1 / 10
};
