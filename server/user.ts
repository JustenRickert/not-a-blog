// @ts-nocheck
import assert from "assert";
import express from "express";

import { userInformation, updatePoints, updatePopulation } from "./api/user";
import { authenticationMiddleware } from "./util";

export default function createUserRouter(db) {
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
}
