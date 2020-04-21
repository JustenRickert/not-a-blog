module.exports = {
  ...module.exports,
  ...require("../util.js")
};

module.exports.withRandomMinusOffset = (n, offsetPercentage = 0.25) => {
  const offset = offsetPercentage * Math.random() * n;
  return n - offset;
};

module.exports.range = n =>
  Array(n)
    .fill()
    .map((_, i) => i);

module.exports.authenticationMiddleware = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.status(403).send();
  }
  next();
};
