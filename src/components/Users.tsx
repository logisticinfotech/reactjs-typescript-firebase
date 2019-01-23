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
      apiKey: "AIzaSyDIRctMKQk2ERxZkWTrY7AwN2-HhbY-C1E",
      authDomain: "airvat-3f130.firebaseapp.com",
      databaseURL: "https://airvat-3f130.firebaseio.com",
      projectId: "airvat-3f130"
    });
    db = firebase.firestore();
  }

  async componentWillMount() {
    this.setState({
      startDate: null,
      endDate: null,
      totalRecords: 0
    });

    await this.getTotalRecords();

    const { pageSize } = this.props.pagination;
    db.collection("users")
      .limit(pageSize)
      .get()
      .then((users: any) => {
        this.setUserResponse(users);
      });
  }

  setUserResponse = (users: any) => {
    const userList: any = [];
    users.forEach((doc: any) => {
      const user = doc.data();
      user.id = doc.id;
      userList.push(user);
    });
    this.props.listUser(userList);
  };

  // Fetch total number of users from firebase
  getTotalRecords = () => {
    const { searchColumn, searchValue } = this.props.pagination;

    if (searchColumn) {
      if (searchColumn === "lastActive") {
        let startDate: any = this.props.pagination.startDate;
        let endDate: any = this.props.pagination.endDate;

        if (startDate && endDate) {
          db.collection("users")
            .where(searchColumn, ">=", startDate)
            .where(searchColumn, "<=", endDate)
            .get()
            .then((users: any) => {
              this.setState({
                totalRecords: users.size
              });
            });
        }
      } else {
        db.collection("users")
          .where(searchColumn, ">=", searchValue)
          .get()
          .then((users: any) => {
            this.setState({
              totalRecords: users.size
            });
          });
      }
    } else {
      db.collection("users")
        .get()
        .then((users: any) => {
          this.setState({
            totalRecords: users.size
          });
        });
    }
  };

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

      await db
        .collection("users")
        .where(column, ">=", search)
        .where(column, "<=", search + "\uf8ff")
        .limit(10)
        .get()
        .then((users: any) => {
          this.setUserResponse(users);
        });
    } else {
      pagination.searchColumn = "";
      pagination.searchValue = "";
      this.props.setPagination(pagination);

      await db
        .collection("users")
        .limit(10)
        .get()
        .then((users: any) => {
          this.setUserResponse(users);
        });
    }
    this.getTotalRecords();
  };

  handleChangeStateDate = async (date: any) => {
    this.setState({
      startDate: date
    });
    setTimeout(() => {
      this.filterDate();
    }, 1);
  };

  handleChangeEndDate = async (date: any) => {
    this.setState({
      endDate: date
    });
    setTimeout(() => {
      this.filterDate();
    }, 1);
  };

  filterDate = async () => {
    let startDate: any = this.state.startDate;
    let endDate: any = this.state.endDate;

    if (startDate && endDate) {
      const column = "lastActive";
      startDate = Number(moment(startDate).format("X")) * 1000;
      endDate = Number(moment(endDate).format("X")) * 1000;

      const pagination = this.props.pagination;
      pagination.searchColumn = column;
      pagination.startDate = startDate;
      pagination.endDate = endDate;
      pagination.searchValue = "";
      pagination.page = 1;
      this.props.setPagination(pagination);

      await db
        .collection("users")
        .where(column, ">=", startDate)
        .where(column, "<=", endDate)
        .limit(10)
        .get()
        .then((users: any) => {
          this.setUserResponse(users);
        });

      this.getTotalRecords();
    } else {
      const pagination = this.props.pagination;
      pagination.searchColumn = "";
      pagination.searchValue = "";
      pagination.page = 1;
      this.props.setPagination(pagination);

      await db
        .collection("users")
        .limit(10)
        .get()
        .then((users: any) => {
          this.setUserResponse(users);
        });
      this.getTotalRecords();
    }
  };

  // Handle page click on particular page
  handlePageChange = async (pageNumber: number) => {
    const pagination = this.props.pagination;
    pagination.page = pageNumber;
    this.props.setPagination(pagination);

    const {
      searchColumn,
      searchValue,
      startDate,
      endDate
    } = this.props.pagination;
    const { pageSize } = this.props.pagination;
    const limitTo = (pageNumber - 1) * pageSize;

    if (searchColumn) {
      if (searchColumn === "lastActive") {
        if (startDate && endDate) {
          if (limitTo > 0) {
            db.collection("users")
              .where(searchColumn, ">=", startDate)
              .where(searchColumn, "<=", endDate)
              .limit(limitTo)
              .get()
              .then((documentSnapshots: any) => {
                var lastVisible =
                  documentSnapshots.docs[documentSnapshots.docs.length - 1];
                db.collection("users")
                  .where(searchColumn, ">=", startDate)
                  .where(searchColumn, "<=", endDate)
                  .startAfter(lastVisible)
                  .limit(pageSize)
                  .get()
                  .then((users: any) => {
                    this.setUserResponse(users);
                  });
              });
          } else {
            db.collection("users")
              .where(searchColumn, ">=", startDate)
              .where(searchColumn, "<=", endDate)
              .limit(pageSize)
              .get()
              .then((users: any) => {
                this.setUserResponse(users);
              });
          }
        }
      } else {
        if (limitTo > 0) {
          db.collection("users")
            .where(searchColumn, ">=", searchValue)
            .where(searchColumn, "<=", searchValue + "\uf8ff")
            .limit(limitTo)
            .get()
            .then((documentSnapshots: any) => {
              var lastVisible =
                documentSnapshots.docs[documentSnapshots.docs.length - 1];
              db.collection("users")
                .where(searchColumn, ">=", searchValue)
                .where(searchColumn, "<=", searchValue + "\uf8ff")
                .startAfter(lastVisible)
                .limit(pageSize)
                .get()
                .then((users: any) => {
                  this.setUserResponse(users);
                });
            });
        } else {
          db.collection("users")
            .where(searchColumn, ">=", searchValue)
            .where(searchColumn, "<=", searchValue + "\uf8ff")
            .limit(pageSize)
            .get()
            .then((users: any) => {
              this.setUserResponse(users);
            });
        }
      }
    } else {
      if (limitTo > 0) {
        db.collection("users")
          .limit(limitTo)
          .get()
          .then((documentSnapshots: any) => {
            var lastVisible =
              documentSnapshots.docs[documentSnapshots.docs.length - 1];
            db.collection("users")
              .startAfter(lastVisible)
              .limit(pageSize)
              .get()
              .then((users: any) => {
                this.setUserResponse(users);
              });
          });
      } else {
        db.collection("users")
          .limit(pageSize)
          .get()
          .then((users: any) => {
            this.setUserResponse(users);
          });
      }
    }
  };

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

    db.collection("users")
      .orderBy(column, sortOrder)
      .limit(pagination.pageSize)
      .get()
      .then((users: any) => {
        this.setUserResponse(users);
      });
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
                  name="account/residenceCountry"
                  onChange={this.onChangeTableFilter}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="account/residenceCity"
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
