const express = require("express");
const { parse } = require("url");
const next = require("next");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient } = require("mongodb");

const createLoginRouter = require("./app/login.js");
const createUserRouter = require("./app/user.js");

const mongoUrl = "mongodb://localhost:27017";

const mongoDbName = "notblog";

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

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(session(expressSessionConfig));

Promise.all([
  app.prepare(),
  MongoClient.connect(mongoUrl).catch(error => {
    console.error(err);
    process.exit(1);
  })
]).then(([, client]) => {
  const db = client.db(mongoDbName);

  server.use("/api/login", createLoginRouter(db));
  server.use("/api/user", createUserRouter(db));

  server.all("*", handle);

  server.listen(3000, err => {
    if (err) throw err;
    console.log("listening on", 3000);
  });
});
