const assert = require("assert");
const express = require("express");

const { userInformation, updatePoints } = require("./api/user.js");

module.exports = createUserRouter = db => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!req.session.authenticated) {
      return res.status(403).send();
    }
    next();
  });

  router.get("/user-information", (req, res) => {
    userInformation(db, { username: req.session.username }).then(
      res.json.bind(res)
    );
    // TODO .catch ?
  });

  router.post("/retrieve-points", (req, res) =>
    updatePoints(db, {
      username: req.session.username,
      updateDate: new Date(req.body.updateDate)
    }).then(result => {
      assert(result.ok, "`result` should be okay?");
      res.json(result.value);
    })
  );

  return router;
};
