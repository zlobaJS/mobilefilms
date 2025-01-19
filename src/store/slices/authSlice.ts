import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  // другие поля состояния авторизации если нужны
}

const initialState: AuthState = {
  isAuthenticated: false,
  // инициализация других полей
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // редьюсеры для изменения состояния
  },
});

export default authSlice.reducer;
