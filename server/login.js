const express = require("express");

const { newUser, authenticateUser } = require("./api/user.js");

module.exports = createLoginRouter = db => {
  const router = express.Router();

  router.post("/create-new-user", (req, res) => {
    newUser(db, req.body)
      .then(() => {
        req.session.authenticated = true;
        req.session.username = req.body.username;
        res.redirect("/index");
      })
      .catch(() => res.status(400).send());
  });

  router.post("/login-user", (req, res) => {
    authenticateUser(db, req.body)
      .then(result => {
        req.session.authenticated = true;
        req.session.username = req.body.username;
        res.status(200).send();
      })
      .catch(e => {
        console.error(e);
        res.status(400).send();
      });
  });

  return router;
};
