import { useEffect, useReducer, points, useState } from "react";
import throttle from "lodash.throttle";

import {
  RETRIEVAL_POINTS_PER_MS,
  RETRIEVAL_TIMEOUT,
  POPULATION_GROWTH_TIMEOUT
} from "../constants.js";
import { createSlice, update, formatInt, plural } from "./util.js";
import Page from "./page.js";
import Industries from "./industries.js";

const fetchUpdatePopulation = updateDate =>
  fetch("/api/user/update-population", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ updateDate })
  });

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
      Get ~{formatInt(estimate)} more {plural(estimate, "point", "points")}!
    </button>
  );
};

const slice = createSlice({
  name: "state",
  reducerMap: {
    setCanRetrievePoints(state, { payload: bool }) {
      return update(state, "canRetrievePoints", bool);
    },
    updatePopulation(
      state,
      {
        payload: { population, lastPopulationChangeDate }
      }
    ) {
      return update(state, ["user"], user => ({
        ...user,
        population,
        lastPopulationChangeDate: new Date(lastPopulationChangeDate)
      }));
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
    user: userInformation,
    canRetrievePoints: null
  });

  useEffect(() => {
    const handleUpdate = updateDate =>
      fetchUpdatePopulation(updateDate)
        .then(res => res.json())
        .then(slice.actions.updatePopulation)
        .then(dispatch);
    const now = new Date();
    const secondsDiff =
      now.valueOf() - state.user.lastPopulationChangeDate.valueOf();
    if (secondsDiff > POPULATION_GROWTH_TIMEOUT) handleUpdate(now);
    const interval = setInterval(
      () => handleUpdate(new Date()),
      POPULATION_GROWTH_TIMEOUT
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

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
      <div>
        <h3>Player</h3>
        <p>Hello, {state.user.username}</p>
        <p>
          Your planet contains a lively population of{" "}
          {formatInt(state.user.population)} aliens!
        </p>
        <p>
          You got {formatInt(state.user.points)} points
          {state.canRetrievePoints && (
            <GetPointsButton {...state.user} onClick={handleRetrievePoints} />
          )}
        </p>
        <Industries user={state.user} />
      </div>
    </Page>
  );
}
