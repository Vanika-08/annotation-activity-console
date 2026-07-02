import { configureStore } from "@reduxjs/toolkit";
import { tasksReducer } from "./slices/tasksSlice";
import { uiReducer } from "./slices/uiSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
      ui: uiReducer,
    },
  });
}

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
