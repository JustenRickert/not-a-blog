const express = require("express");

const { userInformation } = require("./api/user.js");

module.exports = createUserRouter = db => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!req.session.authenticated) {
      return res.status(403).send();
    }
    next();
  });

  router.get("/user-information", (req, res) => {
    return userInformation(db, { username: req.session.username }).then(
      userInformation => res.json(userInformation)
    );
  });

  return router;
};
