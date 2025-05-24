export interface IQuery {
  page: number;
  size: number;
  search?: string;
  order?: "asc" | "desc";
  sortBy?: "date" | "name";
  [key: string]: any;
}