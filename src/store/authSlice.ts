import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/types";

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  name: string | null;
  email: string | null;
  role: Role | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  name: null,
  email: null,
  role: null,
  status: "loading"
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ userId: string; name: string | null; email: string | null; role: Role }>
    ) {
      state.isAuthenticated = true;
      state.status = "authenticated";
      state.userId = action.payload.userId;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearSession(state) {
      state.isAuthenticated = false;
      state.status = "unauthenticated";
      state.userId = null;
      state.name = null;
      state.email = null;
      state.role = null;
    },
    setSessionLoading(state) {
      state.status = "loading";
    }
  }
});

export const { setSession, clearSession, setSessionLoading } = authSlice.actions;
export default authSlice.reducer;
