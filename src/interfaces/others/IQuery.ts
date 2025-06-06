export enum OrderType {
  ASC = "asc",
  DESC = "desc",
}
export enum SortByType {
  NAME = "name",
  DATE = "date",
}
export interface IQuery {
  page: number;
  size: number;
  search?: string;
  order?: OrderType;
  sortBy?: SortByType;
  [key: string]: any;
}
