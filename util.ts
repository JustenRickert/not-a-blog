export const difference = (as, bs, toKey = x => x) =>
  as.filter(a => bs.some(b => toKey(a) !== toKey(b)));

export const omit = (o, keys) =>
  difference(Object.keys(o), keys).reduce(
    (acc, key) => ({
      ...acc,
      [key]: o[key]
    }),
    {}
  );

export const withRandomOffset = (n, offsetPercentage = 0.1) => {
  const r = 2 * (Math.random() - 1 / 2); // [-1, 1)
  return n * (1 + offsetPercentage * r);
};

export const keys = <T>(o: T) => Object.keys(o) as (keyof T)[];
