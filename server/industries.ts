import assert from "assert";
import express from "express";

import { authenticationMiddleware } from "./util";
import {
  industriesInformation,
  employIndustry,
  updateSupply
} from "./api/industries";

export default function createIndustriesRoute(db) {
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
      res.json(result.value[req.body.industryName]);
    });
  });

  router.post("/update-supply", (req, res) => {
    updateSupply(db, {
      id: req.session.userId,
      updateDate: new Date(req.body.updateDate),
      industryName: req.body.industryName
    })
      .then(result => res.json(result.value))
      .catch(e => {
        console.error(e);
        res.status(500).send();
      });
  });

  return router;
}
