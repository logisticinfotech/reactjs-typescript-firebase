import User from "../models/User";
import Pagination from "../models/Pagination";
import { ActionTypes, Action } from "../actions/users";

// Define our State interface for the current reducer
export interface State {
  users: User[];
  pagination: Pagination;
}

// Define our initialState
export const initialState: State = {
  users: [], // We don't have any todos at the start of the app
  pagination: {
    page: 1,
    pageSize: 10,
    sortColumn: "firstName",
    sortOrder: "ASC",
    searchColumn: "",
    searchValue: "",
    startDate: "",
    endDate: "",
  }
};

/*
 * Reducer takes 2 arguments
 * state: The state of the reducer. By default initialState ( if there was no state provided)
 * action: Action to be handled. Since we are in todos reducer, action type is Action defined in our actions/todos file.
 */
export function reducer(state: State = initialState, action: Action) {
  switch (action.type) {
    case ActionTypes.LIST_USER: {
      const { users } = action.payload;
      return {
        ...state,
        users
      };
    }

    case ActionTypes.SET_PAGINATION:
      const { payload } = action;
      return {
        ...state,
        ...{
          pagination: payload.pagination
        }
      };
    default:
      return state;
  }
}
