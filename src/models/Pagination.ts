export default interface Pagination {
  page: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  search: Array<Object>;
  searchCountry: string;
  searchCity: string;
  startDate: number;
  endDate: number;
}
