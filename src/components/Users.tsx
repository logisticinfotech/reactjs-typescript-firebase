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

export default class Users extends React.Component<Props, State> {
  constructor(props: Props, state: State) {
    super(props);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeStateDate = this.handleChangeStateDate.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  async componentWillMount() {
    const config = {
      apiKey: "AIzaSyDIRctMKQk2ERxZkWTrY7AwN2-HhbY-C1E",
      authDomain: "airvat-3f130.firebaseapp.com",
      databaseURL: "https://airvat-3f130.firebaseio.com",
      projectId: "airvat-3f130",
      storageBucket: "airvat-3f130.appspot.com",
      messagingSenderId: "778331008098"
    };

    firebase.initializeApp(config);

    this.setState({
      startDate: null,
      endDate: null,
      totalRecords: 0
    });

    await this.getTotalRecords();
    const { pageSize } = this.props.pagination;
    const UserRef = firebase.database().ref("users");

    UserRef.limitToFirst(pageSize).once("value", user => {
      this.props.listUser(user.val());
    });
  }
  // Fetch total number of users from firebase
  getTotalRecords() {
    const { searchColumn, searchValue } = this.props.pagination;
    const UserRef = firebase.database().ref("users");

    if (searchColumn) {
      UserRef.orderByChild(searchColumn)
        .startAt(searchValue)
        .endAt(searchValue + "\uf8ff")
        .once("value", (user: any) => {
          if (user.val()) {
            const allUsers = Object.keys(user.val());
            this.setState({
              totalRecords: allUsers.length
            });
          } else {
            this.setState({
              totalRecords: 0
            });
          }
        });
    } else {
      UserRef.once("value", user => {
        if (user.val()) {
          const allUsers = Object.keys(user.val());
          this.setState({
            totalRecords: allUsers.length
          });
        } else {
          this.setState({
            totalRecords: 0
          });
        }
      });
    }
  }

  // Search for each coloumn filters
  onChangeTableFilter = async (event: any) => {
    const column = event.target.name;
    let search = event.target.value;
    if (column === "firstName" || column === "surname") {
      search = search.toUpperCase();
    } else if (column === "email") {
      search = search.toLowerCase();
    } else if (
      column === "account/residenceCountry" ||
      column === "account/residenceCity"
    ) {
      search = _.startCase(search);
    }

    const pagination = this.props.pagination;
    pagination.page = 1;
    pagination.startDate = "";
    pagination.endDate = "";

    if (search) {
      pagination.searchColumn = column;
      pagination.searchValue = search;
      this.props.setPagination(pagination);

      const UserRef = firebase.database().ref("users");
      await UserRef.orderByChild(column)
        .startAt(search)
        .endAt(search + "\uf8ff")
        .limitToFirst(10)
        .once("value", (user: any) => {
          this.props.listUser(user.val());
        });
    } else {
      pagination.searchColumn = "";
      pagination.searchValue = "";
      this.props.setPagination(pagination);

      const UserRef = firebase.database().ref("users");
      await UserRef.limitToFirst(10).once("value", user => {
        this.props.listUser(user.val());
      });
    }
    this.getTotalRecords();
  };

  // Handle page click on particular page
  handlePageChange = (pageNumber: number) => {
    const pagination = this.props.pagination;
    pagination.page = pageNumber;
    this.props.setPagination(pagination);

    const { searchColumn, searchValue, pageSize } = this.props.pagination;
    const UserRef = firebase.database().ref("users");

    if (searchColumn) {
      UserRef.orderByChild(searchColumn)
        .startAt(searchValue)
        .endAt(searchValue + "\uf8ff")
        .once("value", user => {
          const allUsers = Object.keys(user.val());
          const key = allUsers[(pageNumber - 1) * pageSize];
          UserRef.orderByKey()
            .limitToFirst(pageSize)
            .startAt(key)
            .once("value", currentPageUser => {
              this.props.listUser(currentPageUser.val());
            });
        });
    } else {
      UserRef.once("value", user => {
        const allUsers = Object.keys(user.val());
        const key = allUsers[(pageNumber - 1) * pageSize];

        UserRef.orderByKey()
          .limitToFirst(pageSize)
          .startAt(key)
          .once("value", currentPageUser => {
            this.props.listUser(currentPageUser.val());
          });
      });
    }
  };

  handleChangeStateDate = async (date: any) => {
    this.setState({
      startDate: date
    });

    let endDate: any = this.state.endDate;

    if (date && endDate) {
      const column = "lastActive";
      let startDate: any = moment(date).format("X");
      endDate = moment(endDate).format("X");
      console.log("startDate", startDate);
      console.log("endDate", endDate);

      const pagination = this.props.pagination;
      pagination.searchColumn = column;
      pagination.startDate = startDate;
      pagination.endDate = endDate;
      pagination.searchValue = "";
      pagination.page = 1;
      this.props.setPagination(pagination);

      startDate = Number(startDate) * 1000;
      endDate = Number(endDate) * 1000;
      const UserRef = firebase.database().ref("users");

      await UserRef.orderByChild(column)
        .startAt(startDate)
        .endAt(endDate)
        .limitToFirst(10)
        .once("value", (user: any) => {
          this.props.listUser(user.val());
        });
      this.getTotalRecords();
    } else {
      const pagination = this.props.pagination;
      pagination.searchColumn = "";
      pagination.searchValue = "";
      pagination.page = 1;
      this.props.setPagination(pagination);

      const UserRef = firebase.database().ref("users");

      await UserRef.limitToFirst(10).once("value", user => {
        this.props.listUser(user.val());
      });
      this.getTotalRecords();
    }
  };

  handleChangeEndDate = async (date: any) => {
    this.setState({
      endDate: date
    });

    let startDate: any = this.state.startDate;

    if (date && startDate) {
      const column = "lastActive";
      startDate = moment(startDate).format("X");
      let endDate: any = moment(date).format("X");
      console.log("startDate", startDate);
      console.log("endDate", endDate);

      const pagination = this.props.pagination;
      pagination.searchColumn = column;
      pagination.startDate = startDate;
      pagination.endDate = endDate;
      pagination.searchValue = "";
      pagination.page = 1;
      this.props.setPagination(pagination);

      startDate = Number(startDate) * 1000;
      endDate = Number(endDate) * 1000;

      const UserRef = firebase.database().ref("users");

      await UserRef.orderByChild(column)
        .startAt(startDate)
        .endAt(endDate)
        .limitToFirst(10)
        .once("value", (user: any) => {
          this.props.listUser(user.val());
        });
      this.getTotalRecords();
    } else {
      const pagination = this.props.pagination;
      pagination.searchColumn = "";
      pagination.searchValue = "";
      pagination.page = 1;
      this.props.setPagination(pagination);

      const UserRef = firebase.database().ref("users");

      await UserRef.limitToFirst(10).once("value", user => {
        this.props.listUser(user.val());
      });
      this.getTotalRecords();
    }
  };

  onClickSort = (column: string) => () => {
    const pagination = this.props.pagination;
    const sortOrder =
      pagination.sortOrder === "ASC" && pagination.sortColumn === column
        ? "DESC"
        : "ASC";
    pagination.sortColumn = column;
    pagination.sortOrder = sortOrder;
    this.props.setPagination(pagination);

    const UserRef = firebase.database().ref("users");

    if (sortOrder === "ASC") {
      UserRef.orderByChild(column)
        .limitToFirst(10)
        .once("value", (user: any) => {
          this.props.listUser(user.val());
        });
    } else {
      UserRef.orderByChild(column)
        .limitToLast(10)
        .once("value", (user: any) => {
          this.props.listUser(user.val());
        });
    }
  };

  render() {
    const {
      users,
      pagination: { page, pageSize }
    } = this.props;
    const { totalRecords } = this.state;

    return (
      <div className="App">
        <table id="example" className="display table table-bordered table-hover">
          <thead >
            <tr>
              <th>User ID</th>
              <th onClick={this.onClickSort("firstName")}>First Name</th>
              <th onClick={this.onClickSort("surname")}>Second Name</th>
              <th onClick={this.onClickSort("email")}>Email</th>
              <th onClick={this.onClickSort("account/residenceCountry")}>
                Residence Country
              </th>
              <th onClick={this.onClickSort("account/residenceCity")}>
                Residence City
              </th>
              <th onClick={this.onClickSort("lastActive")}>Date Last Active</th>
            </tr>
            <tr>
              <th />
              <th>
                <input
                  type="text"
                  name="firstName"
                  onChange={this.onChangeTableFilter}
                />
              </th>
              <th>
                <input
                  type="text"
                  name="surname"
                  onChange={this.onChangeTableFilter}
                />
              </th>
              <th>
                <input
                  type="text"
                  name="email"
                  onChange={this.onChangeTableFilter}
                />
              </th>
              <th>
                <input
                  type="text"
                  name="account/residenceCountry"
                  onChange={this.onChangeTableFilter}
                />
              </th>
              <th>
                <input
                  type="text"
                  name="account/residenceCity"
                  onChange={this.onChangeTableFilter}
                />
              </th>
              <th>
                <DatePicker
                  selected={this.state.startDate}
                  onChange={this.handleChangeStateDate}
                />
                <DatePicker
                  selected={this.state.endDate}
                  onChange={this.handleChangeEndDate}
                />
              </th>
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
        <Pagination
          activePage={page}
          itemsCountPerPage={pageSize}
          totalItemsCount={totalRecords}
          pageRangeDisplayed={5}
          onChange={this.handlePageChange}
        />
      </div>
    );
  }
}
