import { useEffect, useReducer, points, useState } from "react";

import { RETRIEVAL_POINTS_PER_MS, RETRIEVAL_TIMEOUT } from "../constants.js";
import { createSlice, update, formatPoints, plural } from "./util.js";
import Page from "./page.js";

const calculateEstimate = lastRetrievePoints => {
  const now = Date.now();
  const diffMs = now - lastRetrievePoints.valueOf();
  return RETRIEVAL_POINTS_PER_MS * diffMs;
};

const GetPointsButton = ({ lastRetrievePoints, onClick }) => {
  const [estimate, setEstimate] = useState(
    calculateEstimate(lastRetrievePoints)
  );

  useEffect(() => {
    const timeout = setInterval(() => {
      setEstimate(calculateEstimate(lastRetrievePoints));
    }, 1e3);
    return () => {
      clearInterval(timeout);
    };
  }, []);

  return (
    <button onClick={onClick}>
      Get ~{formatPoints(estimate)} more {plural(estimate, "point", "points")}!
    </button>
  );
};

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
    const now = Date.now();
    const diff = now - state.user.lastRetrievePoints.valueOf();
    const timeout = setTimeout(() => {
      dispatch(slice.actions.setCanRetrievePoints(true));
    }, Math.min(RETRIEVAL_TIMEOUT, Math.max(RETRIEVAL_TIMEOUT - diff, 0)));
    return () => {
      clearTimeout(timeout);
    };
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
          <GetPointsButton {...state.user} onClick={handleRetrievePoints} />
        )}
      </p>
    </Page>
  );
}
