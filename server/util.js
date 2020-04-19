module.exports.withRandomOffset = (n, offsetPercentage = 0.1) => {
  const r = 2 * (Math.random() - 1 / 2); // [-1, 1)
  return n * (1 + offsetPercentage * r);
};

module.exports.range = n =>
  Array(n)
    .fill()
    .map((_, i) => i);
