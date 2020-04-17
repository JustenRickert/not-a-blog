import path from "isomorphic-path";

export const domainPath = (req, urlPath) => {
  if (!req) return urlPath;
  return [req.protocol, "://", path.join(req.get("host"), urlPath)].join("");
};

const first = xs => xs[0];

const rest = xs => xs.slice(1);

const complement = p => (...args) => !p(...args);

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
