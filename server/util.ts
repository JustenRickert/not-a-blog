export * from "../util";

export const withRandomMinusOffset = (n, offsetPercentage = 0.25) => {
  const offset = offsetPercentage * Math.random() * n;
  return n - offset;
};

export const range = n =>
  Array(n)
    .fill(undefined)
    .map((_, i) => i);

export const authenticationMiddleware = (req, res, next) => {
  if (!req.session.authenticated) {
    return res.status(403).send();
  }
  next();
};
