export enum OrderType {
  ASC = "asc",
  DESC = "desc",
}
export enum SortByType {
  NAME = "name",
  DATE = "date",
  EMAIL = "email",
  PRICE = "price",
  DURATION = "duration",
}
export interface IQuery {
  page: number;
  size: number;
  search?: string;
  order?: OrderType;
  sortBy?: SortByType;
  [key: string]: any;
}
