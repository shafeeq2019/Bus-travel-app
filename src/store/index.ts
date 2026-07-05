import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import routesReducer from "./routesSlice";
import tripsReducer from "./tripsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      routes: routesReducer,
      trips: tripsReducer
    }
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
