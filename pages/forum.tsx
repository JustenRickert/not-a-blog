import { useReducer, useEffect, useRef } from "react";

import { createSlice } from "../client/util";
import Page from "../client/page";

const reducer = (state, action) => {
  switch (action.type) {
    case "OPEN":
      console.log(action);
      return {
        ...state,
        username: action.username,
        chatSize: action.chatSize
      };
    default:
      return state;
  }
};

export default function Forum({}) {
  const ws = useRef<WebSocket>();
  const [state, dispatch] = useReducer(reducer, {
    username: null,
    chatSize: -1
  });
  useEffect(() => {
    ws.current = new WebSocket("ws://" + location.host + "/forum");

    const handleOpen = event => {
      event.target.send(JSON.stringify({ type: "OPEN" }));
    };

    const handleMessage = event => dispatch(JSON.parse(event.data));

    ws.current.addEventListener("open", handleOpen);
    ws.current.addEventListener("message", handleMessage);
  }, []);
  return (
    <Page>
      {state.username && (
        <>
          <div>{state.username}</div>
          <div>There are {state.chatSize} users</div>
        </>
      )}
    </Page>
  );
}
