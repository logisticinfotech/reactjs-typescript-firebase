import * as React from "react";
import User from "../models/User";
import UserPagination from "../models/Pagination";
import * as firebase from "firebase";
import * as moment from "moment";
import * as _ from "lodash";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "react-js-pagination";
import "./Users.css";

interface Props {
  users: User[];
  pagination: UserPagination;
  listUser: (user: User[]) => void;
  setPagination: (pagination: UserPagination) => void;
}

interface State {
  users: User[];
  pagination: UserPagination;
  startDate: any;
  endDate: any;
  totalRecords: number;
}

let db: any;
export default class Users extends React.Component<Props, State> {
  constructor(props: Props, state: State) {
    super(props);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeStateDate = this.handleChangeStateDate.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    firebase.initializeApp({
      apiKey: "AIzaSyAq4AjIYruaLvZErbtXgRN-33C1lrBuQBA",
      authDomain: "firestoredemo-38e37.firebaseapp.com",
      databaseURL: "https://firestoredemo-38e37.firebaseio.com",
      projectId: "firestoredemo-38e37"
    });
    // firebase.initializeApp({
    //   apiKey: "AIzaSyDIRctMKQk2ERxZkWTrY7AwN2-HhbY-C1E",
    //   authDomain: "airvat-3f130.firebaseapp.com",
    //   databaseURL: "https://airvat-3f130.firebaseio.com",
    //   projectId: "airvat-3f130"
    // });
    db = firebase.firestore();
  }

  async componentWillMount() {
    this.setState({
      startDate: null,
      endDate: null,
      totalRecords: 0
    });

    await this.getTotalRecords();
    await this.filterAndSortAndPaginateUser(this.props.pagination);
  }

  setUserResponse = (users: any) => {
    const userList: any = [];
    users.forEach((doc: any) => {
      const user = doc.data();
      user.id = doc.id;
      console.log("user", user);
      userList.push(user);
    });
    this.props.listUser(userList);
  };

  // Fetch total number of users from firebase
  getTotalRecords = () => {
    const { pagination } = this.props;
    const search: any = pagination.search;
    const { sortColumn, sortOrder, startDate, endDate } = pagination;
    let user = db.collection("users");

    if (startDate > 0 && endDate > 0) {
      user = user
        .where("lastActive", ">=", startDate)
        .where("lastActive", "<=", endDate)
        .orderBy("lastActive");
    }
    if (sortColumn) {
      user = user.orderBy(sortColumn, sortOrder);
    }
    if (search.length > 0) {
      const startAt: any = [];
      search.forEach((searchObj: any) => {
        if (sortColumn !== searchObj.column) {
          user = user.orderBy(searchObj.column);
        }
        startAt.push(searchObj.value);
      });
      user = user.startAt(startAt.join(","));
    }
    user.get().then((users: any) => {
      this.setState({
        totalRecords: users.size
      });
    });
  };

  // Search for each coloumn filters
  onChangeTableFilter = async (event: any) => {
    const column = event.target.name;
    let searchString = event.target.value;
    if (column === "firstName" || column === "surname") {
      searchString = searchString.toUpperCase();
    } else if (column === "email") {
      searchString = searchString.toLowerCase();
    } else if (
      column === "account.residenceCountry" ||
      column === "account.residenceCity"
    ) {
      searchString = _.startCase(searchString);
    }
    const { pagination } = this.props;
    const search: any = pagination.search;
    const index = search.findIndex(
      (searchObj: any) => searchObj.column === column
    );
    if (searchString) {
      if (index !== -1) {
        search[index].value = searchString;
      } else {
        const searchObj: any = {};
        searchObj.column = column;
        searchObj.value = searchString;
        search.push(searchObj);
      }
    } else {
      search.splice(index, 1);
    }
    pagination.page = 1;
    pagination.search = search;
    await this.props.setPagination(pagination);
    await this.filterAndSortAndPaginateUser(pagination);
    await this.getTotalRecords();
  };

  // Search for date start filters
  handleChangeStateDate = async (date: any) => {
    this.setState({
      startDate: date
    });
    if (!date) {
      const pagination = this.props.pagination;
      pagination.startDate = 0;
      await this.props.setPagination(pagination);
    }
    setTimeout(() => {
      this.filterDate();
    }, 1);
  };

  // Search for date end filters
  handleChangeEndDate = async (date: any) => {
    this.setState({
      endDate: date
    });
    if (!date) {
      const pagination = this.props.pagination;
      pagination.endDate = 0;
      await this.props.setPagination(pagination);
    }
    setTimeout(() => {
      this.filterDate();
    }, 1);
  };

  filterDate = async () => {
    let startDate: any = this.state.startDate;
    let endDate: any = this.state.endDate;
    const pagination = this.props.pagination;
    if (startDate && endDate) {
      pagination.startDate = Number(moment(startDate).format("X")) * 1000;
      pagination.endDate = Number(moment(endDate).format("X")) * 1000;
      pagination.page = 1;
    } else {
      pagination.page = 1;
    }
    await this.props.setPagination(pagination);
    await this.filterAndSortAndPaginateUser(pagination);
    await this.getTotalRecords();
  };

  // sorting function
  onClickSort = (column: string) => () => {
    const pagination = this.props.pagination;
    const sortOrder =
      pagination.sortColumn &&
      pagination.sortOrder === "asc" &&
      pagination.sortColumn === column
        ? "desc"
        : "asc";
    pagination.sortColumn = column;
    pagination.sortOrder = sortOrder;
    this.props.setPagination(pagination);
    this.filterAndSortAndPaginateUser(pagination);
  };

  // Handle page click on particular page
  handlePageChange = async (pageNumber: number) => {
    const pagination = this.props.pagination;
    pagination.page = pageNumber;
    await this.props.setPagination(pagination);
    await this.filterAndSortAndPaginateUser(pagination);
  };

  filterAndSortAndPaginateUser = (pagination: UserPagination) => {
    const { pageSize, page } = pagination;
    const limitTo = (page - 1) * pageSize;
    let user = db.collection("users");

    if (limitTo > 0) {
      user = this.createUserQuery(user, pagination);
      user
        .limit(limitTo)
        .get()
        .then((documentSnapshots: any) => {
          var lastVisible =
            documentSnapshots.docs[documentSnapshots.docs.length - 1];
          let subUser = db.collection("users");
          subUser = this.createUserQuery(subUser, pagination);
          subUser
            .startAfter(lastVisible)
            .limit(pageSize)
            .get()
            .then((users: any) => {
              this.setUserResponse(users);
            });
        });
    } else {
      user = this.createUserQuery(user, pagination);
      user
        .limit(pageSize)
        .get()
        .then((users: any) => {
          this.setUserResponse(users);
        });
    }
  };

  createUserQuery = (user: any, pagination: UserPagination) => {
    const search: any = pagination.search;
    const { sortColumn, sortOrder, startDate, endDate } = pagination;
    if (startDate > 0 && endDate > 0) {
      user = user
        .where("lastActive", ">=", startDate)
        .where("lastActive", "<=", endDate)
        .orderBy("lastActive");
    }
    if (sortColumn) {
      user = user.orderBy(sortColumn, sortOrder);
    }
    if (search.length > 0) {
      const startAt: any = [];
      search.forEach((searchObj: any) => {
        if (sortColumn !== searchObj.column) {
          user = user.orderBy(searchObj.column);
        }
        startAt.push(searchObj.value);
      });
      user = user.startAt(startAt.join(","))
      .endAt(search[0].value + "\uf8ff");
    }

    return user;
  };

  render() {
    const {
      users,
      pagination: { page, pageSize }
    } = this.props;
    const { totalRecords } = this.state;

    return (
      <div className="App">
        <table className="display table table-bordered table-hover">
          <thead>
            <tr>
              <th>User ID</th>
              <th onClick={this.onClickSort("firstName")}>First Name</th>
              <th onClick={this.onClickSort("surname")}>Second Name</th>
              <th onClick={this.onClickSort("email")}>Email</th>
              <th onClick={this.onClickSort("account.residenceCountry")}>
                Residence Country
              </th>
              <th onClick={this.onClickSort("account.residenceCity")}>
                Residence City
              </th>
              <th onClick={this.onClickSort("lastActive")}>Date Last Active</th>
            </tr>
            <tr className="search-filter">
              <td />
              <td>
                <input
                  type="text"
                  name="firstName"
                  onChange={this.onChangeTableFilter}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="surname"
                  onChange={this.onChangeTableFilter}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="email"
                  onChange={this.onChangeTableFilter}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="account.residenceCountry"
                  onChange={this.onChangeTableFilter}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="account.residenceCity"
                  onChange={this.onChangeTableFilter}
                />
              </td>
              <td className="date-filter">
                <DatePicker
                  selected={this.state.startDate}
                  onChange={this.handleChangeStateDate}
                />
                <DatePicker
                  selected={this.state.endDate}
                  onChange={this.handleChangeEndDate}
                />
              </td>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.surname}</td>
                  <td>{user.email}</td>
                  <td>{user.account.residenceCountry}</td>
                  <td>{user.account.residenceCity}</td>
                  <td>{moment(user.lastActive).format("DD/MM/YYYY")}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {totalRecords > 0 && (
          <Pagination
            activePage={page}
            itemsCountPerPage={pageSize}
            totalItemsCount={totalRecords}
            pageRangeDisplayed={5}
            onChange={this.handlePageChange}
          />
        )}
      </div>
    );
  }
}
