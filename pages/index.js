import fetch from "isomorphic-unfetch";
import { useReducer } from "react";

import { createSlice, update, domainPath } from "../client/util.js";
import Page from "../client/page.js";
import Main from "../client/main.js";
import Login from "../client/login.js";

const fetchUserInformation = req =>
  fetch(domainPath(req, "/api/user/user-information"), {
    headers: req && req.headers
  });

const serializeDateInformation = ({
  createdDate,
  lastRetrievePoints,
  lastPopulationChangeDate,
  ...userInformation
}) => ({
  ...userInformation,
  createdDate: new Date(createdDate),
  lastRetrievePoints: new Date(lastRetrievePoints),
  lastPopulationChangeDate: new Date(lastPopulationChangeDate)
});

const slice = createSlice({
  name: "state",
  reducerMap: {
    setUserInformation(state, { payload: userInformation }) {
      return update(
        state,
        "userInformation",
        serializeDateInformation(userInformation)
      );
    }
  }
});

Home.getInitialProps = ({ req }) => {
  return fetchUserInformation(req).then(res => {
    switch (res.status) {
      case 200:
        return res.json().then(userInformation => ({ userInformation }));
      case 403:
        return { userInformation: null };
      default:
        throw new Error("not impl");
    }
  });
};

export default function Home({ userInformation, ...rest }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    userInformation: serializeDateInformation(userInformation)
  });
  const handleUserInformationChange = () =>
    fetchUserInformation()
      .then(res => res.json())
      .then(userInformation =>
        dispatch(slice.actions.setUserInformation(userInformation))
      );
  if (!state.userInformation)
    return <Login onChangeUserInformation={handleUserInformationChange} />;
  return <Main userInformation={state.userInformation} />;
}
