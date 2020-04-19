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

export default function({ user }) {
  const [state, dispatch] = useReducer(slice.reducer, {
    industries: Object.keys(INDUSTRIES).reduce(
      (industries, key) => ({
        ...industries,
        [key]: {
          allocation: 0
        }
      }),
      {}
    )
  });
  return (
    <>
      <h3>Industries</h3>
    </>
  );
}
