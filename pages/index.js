import fetch from "isomorphic-unfetch";
import { useReducer } from "react";

import { createSlice, update, domainPath } from "../lib/util.js";
import Page from "../lib/page.js";
import Main from "../lib/main.js";
import Login from "../lib/login.js";

const slice = createSlice({
  name: "state",
  reducerMap: {
    setUserInformation(state, { payload: userInformation }) {
      return update(state, "userInformation", userInformation);
    }
  }
});

Home.getInitialProps = ({ req }) => {
  return fetch(domainPath(req, "/api/user-information"), {
    headers: req && req.headers
  }).then(res => {
    switch (res.status) {
      case 200:
        return res.json().then(({ userInformation }) => ({ userInformation }));
      case 403:
        return { userInformation: null };
      default:
        throw new Error("not impl");
    }
  });
};

export default function Home({ userInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    userInformation
  });
  const handleUserInformationChange = userInformation =>
    dispatch(slice.actions.setUserInformation(userInformation));
  if (!state.userInformation)
    return <Login onChangeUserInformation={handleUserInformationChange} />;
  return <Main userInformation={userInformation} />;
}
