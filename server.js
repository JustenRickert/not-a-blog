const express = require("express");
const { parse } = require("url");
const next = require("next");
const bodyParser = require("body-parser");
const session = require("express-session");

const { newUser, authenticateUser } = require("./app/user.js");

const server = express();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: server.get("env") === "development" });
const handle = app.getRequestHandler();

const expressSessionConfig = {
  secret: "TODO change me",
  saveUninitialized: false,
  resave: false,
  cookie: {}
};

if (server.get("env") === "production") {
  server.set("trust proxy", 1);
  sess.cookie.secure = true;
}

app.prepare().then(() => {
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use(session(expressSessionConfig));

  server.post("/api/create-new-user", (req, res) => {
    const { username, password } = req.body;
    newUser(username, password)
      .then(() => {
        req.session.authenticated = true;
        req.session.username = username;
        res.redirect("/index");
      })
      .catch(() => res.status(400).send());
  });

  server.post("/api/login-user", (req, res) => {
    const { username, password } = req.body;
    authenticateUser(username, password)
      .then(() => {
        req.session.authenticated = true;
        req.session.username = username;
        res.json({
          userInformation: {
            username: req.session.username
          }
        });
      })
      .catch(() => req.status(400).send());
  });

  server.get("/api/user-information", (req, res) => {
    if (req.session.authenticated) {
      return res.json({
        userInformation: {
          username: req.session.username
        }
      });
    } else {
      return res.status(403).send();
    }
  });

  server.all("*", handle);

  server.listen(3000, err => {
    if (err) throw err;
    console.log("listening on", 3000);
  });
});
