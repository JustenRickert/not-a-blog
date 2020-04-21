import { useEffect, useRef } from "react";
import path from "isomorphic-path";

import { omit, withRandomOffset } from "../util.js";

export * from "../util.js";

export const domainPath = (req, urlPath) => {
  if (!req) return urlPath;
  return [req.protocol, "://", path.join(req.get("host"), urlPath)].join("");
};

const first = xs => xs[0];

const rest = xs => xs.slice(1);

// const complement = p => (...args) => !p(...args);

export const createSlice = ({ name, reducerMap, initialState }) => {
  const actions = Object.keys(reducerMap).reduce(
    (actions, key) =>
      Object.assign(actions, {
        [key]: payload => ({ sliceName: name, type: key, payload })
      }),
    {}
  );
  const reducer = (state = initialState, action = undefined) => {
    if (!action || action.sliceName !== name) return state;
    return reducerMap[action.type](state, action);
  };
  return {
    actions,
    reducer
  };
};

export const update = (state, key, fnOrState) => {
  if (typeof key === "string") key = key.split(".");
  if (!key.length)
    return fnOrState instanceof Function ? fnOrState(state) : fnOrState;
  return {
    ...state,
    [first(key)]: update(state[first(key)], rest(key), fnOrState)
  };
};

export const formatInt = points => Math.floor(points).toLocaleString();

export const plural = (n, single, plural) => {
  if (n === 1) return single;
  else return plural;
};

export const serializeIndustryDateInformation = ({
  lastUpdateSupplyDate,
  lastEmploymentUpdateDate,
  ...industry
}) => ({
  ...industry,
  lastUpdateSupplyDate: new Date(lastUpdateSupplyDate),
  lastEmploymentUpdateDate: new Date(lastEmploymentUpdateDate)
});

export const shallowEqualOmitting = (...keys) => (previous, next) => {
  previous = omit(previous, keys);
  return Object.entries(previous).some(([key, p]) => p === next[key]);
};

export const useDeviationInterval = (
  callback,
  lastUpdateDate,
  ms,
  offsetPercentage = 0.1
) => {
  useEffect(() => {
    const sinceLast = Date.now() - lastUpdateDate.getTime();
    const timeout = setTimeout(
      callback,
      withRandomOffset(Math.max(0, ms - sinceLast), offsetPercentage)
    );
    return () => {
      clearTimeout(timeout);
    };
  }, [callback, lastUpdateDate]);
};
