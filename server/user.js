const assert = require("assert");
const express = require("express");

const {
  userInformation,
  updatePoints,
  updatePopulation
} = require("./api/user.js");
const { authenticationMiddleware } = require("./util.js");

// TODO Do these need `catch`s?

module.exports = createUserRouter = db => {
  const router = express.Router();

  router.use(authenticationMiddleware);

  router.get("/user-information", (req, res) => {
    userInformation(db, { id: req.session.userId }).then(result => {
      res.json(result);
    });
  });

  router.post("/update-points", (req, res) =>
    updatePoints(db, {
      id: req.session.userId,
      updateDate: new Date(req.body.updateDate)
    }).then(result => {
      assert(result.ok, "`result` should be okay?");
      res.json(result.value);
    })
  );

  router.post("/update-population", (req, res) => {
    updatePopulation(db, {
      id: req.session.userId,
      updateDate: new Date(req.body.updateDate)
    }).then(result => {
      assert(result.ok, "`result` should be okay?");
      res.json(result.value);
    });
  });

  return router;
};
