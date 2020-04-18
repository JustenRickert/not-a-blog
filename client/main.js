import { useEffect, useReducer } from "react";

import { createSlice, update, formatPoints } from "./util.js";
import Page from "./page.js";

const RETRIEVAL_TIMEOUT = 10e3;

const slice = createSlice({
  name: "state",
  reducerMap: {
    setCanRetrievePoints(state, { payload: bool }) {
      return update(state, "canRetrievePoints", bool);
    },
    updatePointsRetrieve(
      state,
      {
        payload: { points, lastRetrievePoints }
      }
    ) {
      return update(state, "user", user => ({
        ...user,
        points,
        lastRetrievePoints: new Date(lastRetrievePoints)
      }));
    }
  }
});

// TODO(?) rename `lastRetrievePoints` to `lastRetrievePointsDate`
export default function Main({ userInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    user: {
      ...userInformation,
      lastRetrievePoints: new Date(userInformation.lastRetrievePoints)
    },
    canRetrievePoints: null
  });

  useEffect(() => {
    setTimeout(() => {
      dispatch(slice.actions.setCanRetrievePoints(true));
    }, RETRIEVAL_TIMEOUT);
  }, [state.user.lastRetrievePoints]);

  const handleRetrievePoints = () => {
    dispatch(slice.actions.setCanRetrievePoints(false));
    fetch("/api/user/retrieve-points", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ updateDate: new Date() })
    })
      .then(res => res.json())
      .then(slice.actions.updatePointsRetrieve)
      .then(dispatch);
  };

  return (
    <Page>
      <p>Hello, {state.user.username}</p>
      <p>
        You got {formatPoints(state.user.points)} points
        {state.canRetrievePoints && (
          <>
            {" "}
            <button onClick={handleRetrievePoints}>Get points!</button>
          </>
        )}
      </p>
    </Page>
  );
}
