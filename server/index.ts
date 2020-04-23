import express from "express";
import { parse } from "url";
import next from "next";
import bodyParser from "body-parser";
import session from "express-session";
import { MongoClient } from "mongodb";
import ConnectMongo from "connect-mongo";
import expressWs from "express-ws";

import createLoginRouter from "./login";
import createUserRouter from "./user";
import createIndustriesRoute from "./industries";
import createForumRouter from "./forum";

const MongoSessionStore = ConnectMongo(session);

const mongoUrl = "mongodb://localhost:27017";

const mongoDbName = "notblog";

const wsServer = expressWs(express());
const server = wsServer.app;

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
  server.use("/api/industries", createIndustriesRoute(db));

  server.use("/forum", createForumRouter(db, wsServer));

  server.all("*", handle as any);

  server.listen(3000, err => {
    if (err) throw err;
    console.log("listening on", 3000);
  });
});
