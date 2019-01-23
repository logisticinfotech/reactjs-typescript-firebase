export default interface Pagination {
  page: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  search: Array<Object>;
  searchColumn: string;
  searchValue: string;
  startDate: number;
  endDate: number;
}
