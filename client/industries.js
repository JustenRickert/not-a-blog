import { useReducer } from "react";
import { createSlice } from "./util.js";

const INDUSTRIES = {
  baking: {}
};

const slice = createSlice({
  name: "state",
  reducerMap: {}
});

// TODO whatta do 'bout it?

export default function({ user, industriesInformation }) {
  const [state, dispatch] = useReducer(slice.reducer, industriesInformation);
  return (
    <>
      <h3>Industries</h3>
    </>
  );
}
