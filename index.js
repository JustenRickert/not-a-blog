const express = require("express");
const { parse } = require("url");
const next = require("next");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient } = require("mongodb");
const MongoSessionStore = require("connect-mongo")(session);

const createLoginRouter = require("./server/login.js");
const createUserRouter = require("./server/user.js");

const mongoUrl = "mongodb://localhost:27017";

const mongoDbName = "notblog";

const server = express();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const mongoClientPromise = MongoClient.connect(mongoUrl).catch(err => {
  console.error(err);
  process.exit(1);
});

const expressSessionConfig = {
  secret: "TODO change me",
  saveUninitialized: false,
  resave: false,
  store: new MongoSessionStore({
    clientPromise: mongoClientPromise,
    url: mongoUrl
  }),
  cookie: {}
};

// if (server.get("env") === "production") {
//   server.set("trust proxy", 1);
//   expressSessionConfig.cookie.secure = true;
// }

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(session(expressSessionConfig));

Promise.all([app.prepare(), mongoClientPromise]).then(([, client]) => {
  const db = client.db(mongoDbName);

  server.use("/api/login", createLoginRouter(db));
  server.use("/api/user", createUserRouter(db));

  server.all("*", handle);

  server.listen(3000, err => {
    if (err) throw err;
    console.log("listening on", 3000);
  });
});
