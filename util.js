module.exports.difference = difference = (as, bs, toKey = x => x) =>
  as.filter(a => bs.some(b => toKey(a) !== toKey(b)));

module.exports.omit = omit = (o, keys) =>
  difference(Object.keys(o), keys).reduce(
    (acc, key) => ({
      ...acc,
      [key]: o[key]
    }),
    {}
  );

module.exports.withRandomOffset = (n, offsetPercentage = 0.1) => {
  const r = 2 * (Math.random() - 1 / 2); // [-1, 1)
  return n * (1 + offsetPercentage * r);
};
