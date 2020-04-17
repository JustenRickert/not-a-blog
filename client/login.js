import fetch from "isomorphic-unfetch";
import { useReducer } from "react";
import Page from "./page.js";
import Link from "next/link";
import { createSlice, update, domainPath } from "./util.js";

const LOGIN_DEFAULT = {
  username: "",
  password: ""
};

const slice = createSlice({
  name: "state",
  reducerMap: {
    resetLogin(state) {
      return update(state, "login", LOGIN_DEFAULT);
    },
    updateLogin(
      state,
      {
        payload: { key, value }
      }
    ) {
      return update(state, ["login", key], value);
    },
    setError(state, { payload: error }) {
      return update(state, "error", error);
    }
  }
});

export default function Login({ onChangeUserInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    error: false,
    login: LOGIN_DEFAULT
  });
  const handleFormUpdate = e =>
    dispatch(
      slice.actions.updateLogin({
        key: e.target.name,
        value: e.target.value
      })
    );
  const handleFormSubmit = e => {
    e.preventDefault();
    fetch("/api/login/login-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state.login)
    }).then(res => {
      switch (res.status) {
        case 200:
          onChangeUserInformation();
          break;
        case 400:
          dispatch(slice.actions.setError(true));
          dispatch(slice.actions.resetLogin());
          break;
      }
    });
  };
  return (
    <Page>
      <form>
        <label htmlFor="username">Username: </label>
        <input
          id="username"
          name="username"
          onChange={handleFormUpdate}
          value={state.login.username}
        />
        <label htmlFor="username">Password: </label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={handleFormUpdate}
          value={state.login.password}
        />
        <input onClick={handleFormSubmit} type="submit" value="Login" />
        {state.error && "ERROR"}
      </form>
      <Link href="/new-user">
        <button>Create new Account</button>
      </Link>
    </Page>
  );
}
