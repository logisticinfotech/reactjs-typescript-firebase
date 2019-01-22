import { combineReducers } from "redux";
import * as fromUsers from "./users";

/*
 * This is the root state of the app
 * It contains every sub state of the app
 */
export interface State {
  users: fromUsers.State;
}

/*
 * initialState of the app
 */
export const initialState: State = {
  users: fromUsers.initialState,
};

/*
 * Root reducer of the app
 * Returned reducer will be of type Reducer<State>
 */
export const reducer = combineReducers<State>({
  users: fromUsers.reducer,
});

export default reducer;
