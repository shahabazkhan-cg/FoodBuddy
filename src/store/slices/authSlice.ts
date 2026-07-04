import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ApiUser, AuthResponse } from "../api/types";

export interface AuthState {
  user: ApiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  user_id: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  user_id: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Store credentials returned after a successful login. */
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    /** Clear all auth state on logout. */
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.user_id = null;
    },

    /** Set the selected user ID. */
    setUserId: (state, action: PayloadAction<string>) => {
      state.user_id = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setUserId } =
  authSlice.actions;
export default authSlice.reducer;
