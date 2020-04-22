import express from "express";

import { newUser, authenticateUser } from "./api/user";

export default function createLoginRouter(db) {
  const router = express.Router();

  router.post("/create-new-user", (req, res) => {
    newUser(db, req.body)
      .then(result => {
        req.session.authenticated = true;
        req.session.userId = result.insertedId;
        res.redirect("/index");
      })
      .catch(() => res.status(400).send());
  });

  router.post("/login-user", (req, res) => {
    authenticateUser(db, req.body)
      .then(resultId => {
        req.session.authenticated = true;
        req.session.userId = resultId;
        res.status(200).send();
      })
      .catch(() => res.status(400).send());
  });

  return router;
}
