import fetch from "isomorphic-unfetch";
import { useReducer } from "react";
import Page from "./page.js";
import Link from "next/link";
import { createSlice, update, domainPath } from "./util.js";

const slice = createSlice({
  name: "state",
  reducerMap: {
    updateLogin(
      state,
      {
        payload: { key, value }
      }
    ) {
      return update(state, ["login", key], value);
    }
  }
});

export default function Login({ onChangeUserInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    login: {
      username: "",
      password: ""
    }
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
    fetch("/api/login-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state.login)
    }).then(res => {
      switch (res.status) {
        case 200:
          res
            .json()
            .then(({ userInformation }) =>
              onChangeUserInformation(userInformation)
            );
          break;
        case 400:
          throw new Error("400 not handled");
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
      </form>
      <Link href="/new-user">
        <button>Create new Account</button>
      </Link>
    </Page>
  );
}
