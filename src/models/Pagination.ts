export default interface Pagination {
  page: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  searchColumn: string;
  searchValue: string;
  startDate: string;
  endDate: string;
}
