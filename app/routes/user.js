const express = require("express");

module.exports = createUserRouter = () => {
  const router = express.Router();

  router.use((req, res, next) => {
    console.log("auth?");
    console.log(req.session.authenticated);
    if (!req.session.authenticated) {
      return res.status(403).send();
    }
    next();
  });

  router.get("/user-information", (req, res) => {
    console.log("user info", req.session);
    return res.json({
      userInformation: {
        username: req.session.username
      }
    });
  });

  return router;
};
