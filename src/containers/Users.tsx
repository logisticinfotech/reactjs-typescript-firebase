import { connect } from "react-redux";
import { State } from "../reducers";
import { listUser, setPagination } from "../actions/users";
import Users from "../components/Users";

const mapStateToProps = (state: State) => {
  return {
    users: state.users.users,
    pagination: state.users.pagination,
  }
};

const mapDispatchToProps = {
  listUser: listUser,
  setPagination: setPagination,
};

export default connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Users);
