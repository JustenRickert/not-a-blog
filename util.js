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
