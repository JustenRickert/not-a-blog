module.exports.POPULATION_CAPACITY_INITIAL = 1000;
module.exports.POPULATION_CAPACITY_PER_POINT = 1 / 10e3;
module.exports.POPULATION_GROWTH_PERCENTAGE = 0.001;
module.exports.POPULATION_GROWTH_SECONDS = populationGrowthSeconds = 30;
module.exports.POPULATION_GROWTH_TIMEOUT = 10 * 1e3 * populationGrowthSeconds;

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

module.exports.INDUSTRIES_PRODUCTION_BAKING = 1;
module.exports.INDUSTRIES_PRODUCTION_HAND_TOOL = 1 / 10;
