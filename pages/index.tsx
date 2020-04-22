import fetch from "isomorphic-unfetch";
import { useReducer } from "react";
import dynamic from "next/dynamic";

import {
  createSlice,
  domainPath,
  serializeIndustryDateInformation,
  update
} from "../client/util";
import Page from "../client/page";
import Login from "../client/login";
import { Industries } from "../types";

const Main = dynamic(() => import("../client/main"));

const fetchUserInformation = (req?: Request) =>
  fetch(domainPath(req, "/api/user/user-information"), {
    headers: req && req.headers
  });

const fetchIndustriesInformation = req =>
  fetch(domainPath(req, "/api/industries/industries-information"), {
    headers: req && req.headers
  });

const serializeUserDateInformation = ({
  createdDate,
  lastUpdatePointsDate,
  lastPopulationChangeDate,
  ...userInformation
}) => ({
  ...userInformation,
  createdDate: new Date(createdDate),
  lastUpdatePointsDate: new Date(lastUpdatePointsDate),
  lastPopulationChangeDate: new Date(lastPopulationChangeDate)
});

const serializeIndustriesDateInformation = (
  industriesInformation: Industries
) =>
  Object.entries(industriesInformation).reduce(
    (acc, [name, industry]) => ({
      ...acc,
      [name]: serializeIndustryDateInformation(industry)
    }),
    {}
  );

const slice = createSlice({
  name: "state",
  reducerMap: {
    setUserInformation(state, { payload: userInformation }) {
      return update(
        state,
        "userInformation",
        serializeUserDateInformation(userInformation)
      );
    }
  }
});

Home.getInitialProps = ({ req }) => {
  return Promise.all([
    fetchUserInformation(req),
    fetchIndustriesInformation(req)
  ]).then(responses => {
    if (responses.some(res => res.status === 403)) return {};
    if (responses.some(res => res.status !== 200)) {
      console.log(responses);
      throw new Error("Problem retrieving information on server");
    }
    return Promise.all(responses.map(res => res.json())).then(
      ([userInformation, industriesInformation]) => ({
        userInformation,
        industriesInformation: industriesInformation
      })
    );
  });
};

export default function Home({ userInformation, industriesInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    userInformation:
      userInformation && serializeUserDateInformation(userInformation),
    industriesInformation:
      industriesInformation &&
      serializeIndustriesDateInformation(industriesInformation)
  });
  const handleUserInformationChange = () =>
    fetchUserInformation()
      .then(res => res.json())
      .then(userInformation =>
        dispatch(slice.actions.setUserInformation(userInformation))
      );
  if (!state.userInformation)
    return (
      <Page>
        <Login onChangeUserInformation={handleUserInformationChange} />
      </Page>
    );
  return (
    <Page>
      <Main
        userInformation={state.userInformation}
        industriesInformation={state.industriesInformation}
      />
    </Page>
  );
}
