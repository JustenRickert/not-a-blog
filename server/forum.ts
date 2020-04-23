// @ts-nocheck
import express from "express";

import { userInformation } from "./api/user";

import { authenticationMiddleware } from "./util";

export default function createForumRouter(db, wsServer) {
  const router = express.Router();

  const forumWss = wsServer.getWss("/forum");

  router.use(authenticationMiddleware);

  router.ws("/", (ws, req) => {
    ws.on("message", msg => {
      msg = JSON.parse(msg);
      switch (msg.type) {
        case "OPEN":
          userInformation(db, { id: req.session.userId }).then(user => {
            ws.send(
              JSON.stringify({
                type: "OPEN",
                username: user.username,
                chatSize: forumWss.clients.size
              })
            );
          });
          break;
      }
    });
  });

  return router;
}
