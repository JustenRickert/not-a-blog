import { useReducer, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

import {
  INDUSTRIES_UPDATE_SUPPLY_TIMEOUT,
  INDUSTRY_LABELS
} from "../constants";
import {
  createSlice,
  plural,
  serializeIndustriesDateInformation,
  update,
  useDeviationInterval,
  formatInt,
  serializeIndustryDateInformation
} from "./util";
import { Industries as IndustriesType } from "../types";

const EmployButton = dynamic(() => import("./employ-button"), {
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

const slice = createSlice<IndustriesType>({
  name: "state",
  reducerMap: {
    resetIndustryUpdateSupplyTimeout(state, { payload: { industryName } }) {
      return update(state, [industryName, "lastUpdateSupplyDate"], new Date());
    },
    updateIndustry(state, { payload: { industryName, industry } }) {
      return update(
        state,
        [industryName],
        serializeIndustryDateInformation(industry)
      );
    },
    updateIndustries(state, { payload: industries }) {
      return {
        ...state,
        ...serializeIndustriesDateInformation(industries)
      };
    }
  }
});

export default function Industries({
  user,
  industriesInformation
}: {
  user: any;
  industriesInformation: IndustriesType;
}) {
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
        fetchUpdateSupply({ industryName })
          .then(res => res.json())
          .then(
            industries => slice.actions.updateIndustries(industries),
            // Sometimes we're not very good at programming, and we don't want
            // to infinite loop :)
            e => {
              console.error(e);
              return slice.actions.resetIndustryUpdateSupplyTimeout({
                industryName
              });
            }
          )
          .then(dispatch),
      lastUpdateSupplyDate,
      INDUSTRIES_UPDATE_SUPPLY_TIMEOUT
    )
  );

  const handleEmploy = industryName => {
    fetchEmployIndustry({
      industryName
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
      <p>{formatInt(totalUnallocated)} unemployed aliens</p>
      <ul>
        {industryEntries.map(
          ([
            industryName,
            { allocation, supply, lastEmploymentUpdateDate }
          ]) => (
            <li key={industryName}>
              <h4>
                <i>{INDUSTRY_LABELS[industryName]}</i>
              </h4>
              <p>
                Employs {allocation} {plural(allocation, "alien", "aliens")}
              </p>
              <p>Has {formatInt(supply)} product on hand</p>
              <ul>
                <li>
                  <EmployButton
                    industryName={industryName}
                    // TODO this inline callback causes unnecessary rerenders...
                    // :shrug:
                    onClick={() => handleEmploy(industryName)}
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
