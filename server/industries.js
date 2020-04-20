const assert = require("assert");
const express = require("express");

const { authenticationMiddleware } = require("./util.js");
const {
  industriesInformation,
  employIndustry
} = require("./api/industries.js");

module.exports = createIndustriesRoute = db => {
  const router = express.Router();

  router.use(authenticationMiddleware);

  router.get("/industries-information", (req, res) => {
    industriesInformation(db, {
      id: req.session.userId
    })
      .then(result => res.json(result))
      .catch(e => {
        console.log(e);
        res.status(500).send();
      });
  });

  router.post("/employ-industry", (req, res) => {
    employIndustry(db, {
      id: req.session.userId,
      updateDate: new Date(req.body.updateDate),
      industryName: req.body.industryName
    }).then(result => {
      res.json(result);
    });
  });

  return router;
};
