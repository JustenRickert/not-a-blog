import { useReducer, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

import { INDUSTRIES_UPDATE_SUPPLY_TIMEOUT } from "../constants.js";
import {
  createSlice,
  plural,
  serializeIndustryDateInformation,
  update,
  useDeviationInterval,
  formatInt
} from "./util.js";

const EmployButton = dynamic(() => import("./employ-button.js"), {
  ssr: false // time variation between server/client
});

const fetchEmployIndustry = payload =>
  fetch("/api/industries/employ-industry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

const fetchUpdateSupply = payload =>
  fetch("/api/industries/update-supply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

const labels = {
  baking: "Baking",
  handTool: "Hand tools"
};

const slice = createSlice({
  name: "state",
  reducerMap: {
    updateIndustry(
      state,
      {
        payload: { industry, industryName }
      }
    ) {
      return update(
        state,
        [industryName],
        serializeIndustryDateInformation(industry)
      );
    }
  }
});

export default function Industries({ user, industriesInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, industriesInformation);

  const industryEntries = Object.entries(state);
  const totalAllocated = industryEntries.reduce(
    (totalAllocated, [, { allocation }]) => totalAllocated + allocation,
    0
  );
  const totalUnallocated = user.population - totalAllocated;

  industryEntries.forEach(([industryName, { lastUpdateSupplyDate }]) =>
    useDeviationInterval(
      () =>
        fetchUpdateSupply({
          updateDate: new Date(),
          industryName
        })
          .then(res => res.json())
          .then(industry =>
            slice.actions.updateIndustry({ industry, industryName })
          )
          .then(dispatch),
      lastUpdateSupplyDate,
      INDUSTRIES_UPDATE_SUPPLY_TIMEOUT
    )
  );

  const handleEmploy = (industryName, updateDate) => {
    fetchEmployIndustry({
      industryName,
      updateDate
    })
      .then(res => res.json())
      .then(industry =>
        slice.actions.updateIndustry({ industry, industryName })
      )
      .then(dispatch);
  };

  return (
    <>
      <h3>Industries</h3>
      <p>{totalUnallocated} unemployed aliens</p>
      <ul>
        {industryEntries.map(
          ([
            industryName,
            { allocation, supply, lastEmploymentUpdateDate }
          ]) => (
            <li key={industryName}>
              <h4>{labels[industryName]}</h4>
              <p>
                Employs {allocation} {plural(allocation, "alien", "aliens")}
              </p>
              <p>Has {formatInt(supply)} product on hand</p>
              <ul>
                <li>
                  <EmployButton
                    industryName={industryName}
                    // TODO this causes unnecessary rerenders...
                    onClick={() => handleEmploy(industryName, new Date())}
                    lastEmploymentUpdateDate={lastEmploymentUpdateDate}
                    disabled={!totalUnallocated}
                  />
                </li>
              </ul>
            </li>
          )
        )}
      </ul>
    </>
  );
}
