import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  autoplayTrailer: boolean;
}

const initialState: SettingsState = {
  autoplayTrailer: localStorage.getItem("autoplayTrailer") !== "false",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleAutoplayTrailer: (state) => {
      state.autoplayTrailer = !state.autoplayTrailer;
      localStorage.setItem("autoplayTrailer", state.autoplayTrailer.toString());
    },
  },
});

export const { toggleAutoplayTrailer } = settingsSlice.actions;
export default settingsSlice.reducer;
