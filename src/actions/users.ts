import User from "../models/User";
import Pagination from "../models/Pagination";

/*
 * We're defining every action name constant here
 * We're using Typescript's enum
 * Typescript understands enum better
 */
export enum ActionTypes {
  LIST_USER = "[users] LIST_USER",
  SET_PAGINATION = "[users] SET_PAGINATION",
}

/*
 * Define return types of our actions
 * Every action returns a type and a payload
 */
export interface ListUserAction {
  type: ActionTypes.LIST_USER;
  payload: {
    users: User[];
  };
}
export interface SetPaginationAction {
  type: ActionTypes.SET_PAGINATION;
  payload: {
    pagination: Pagination;
  };
}

/*
 * Define our actions creators
 * We are returning the right Action for each function
 */
export function listUser(users: User[]): ListUserAction {
  return {
    type: ActionTypes.LIST_USER,
    payload: {
      users,
    }
  };
}

export function setPagination(pagination: Pagination): SetPaginationAction {
  return {
    type: ActionTypes.SET_PAGINATION,
    payload: {
      pagination: pagination,
    }
  };
}

/*
 * Define the Action type
 * It can be one of the types defining in our action/todos file
 * It will be useful to tell typescript about our types in our reducer
 */
export type Action = ListUserAction | SetPaginationAction;
