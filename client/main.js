import { useEffect, useReducer } from "react";
import dynamic from "next/dynamic";

import { POPULATION_GROWTH_TIMEOUT } from "../constants.js";
import { createSlice, formatInt } from "./util.js";
import Industries from "./industries.js";

const GetPointsButton = dynamic(() => import("./get-points-button.js"), {
  ssr: false // relies on time, which is inconsistent between client and server
});

const fetchUpdatePopulation = updateDate =>
  fetch("/api/user/update-population", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ updateDate })
  });

const slice = createSlice({
  name: "state",
  reducerMap: {
    updatePopulation(
      state,
      {
        payload: { population, lastPopulationChangeDate }
      }
    ) {
      return {
        ...state,
        population,
        lastPopulationChangeDate: new Date(lastPopulationChangeDate)
      };
    },
    updatePointsRetrieve(
      state,
      {
        payload: { points, lastUpdatePointsDate }
      }
    ) {
      return {
        ...state,
        points,
        lastUpdatePointsDate: new Date(lastUpdatePointsDate)
      };
    }
  }
});

export default function Main({ userInformation, industriesInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, userInformation);

  useEffect(() => {
    const handleUpdate = updateDate =>
      fetchUpdatePopulation(updateDate)
        .then(res => res.json())
        .then(slice.actions.updatePopulation)
        .then(dispatch);
    const now = new Date();
    const secondsDiff =
      now.valueOf() - state.lastPopulationChangeDate.getTime();
    if (secondsDiff > POPULATION_GROWTH_TIMEOUT) handleUpdate(now);
    const interval = setInterval(
      () => handleUpdate(new Date()),
      POPULATION_GROWTH_TIMEOUT
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleRetrievePoints = () =>
    fetch("/api/user/update-points", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ updateDate: new Date() })
    })
      .then(res => res.json())
      .then(slice.actions.updatePointsRetrieve)
      .then(dispatch);

  return (
    <div>
      <section>
        <h3>Player</h3>
        <p>Hello, {state.username}</p>
        <p>
          Your planet contains a lively population of{" "}
          {formatInt(state.population)} aliens!
        </p>
        <p>You got {formatInt(state.points)} points</p>
        <ul>
          <li>
            <GetPointsButton {...state} onClick={handleRetrievePoints} />
          </li>
        </ul>
      </section>
      <section>
        <Industries
          industriesInformation={industriesInformation}
          user={state}
        />
      </section>
    </div>
  );
}
