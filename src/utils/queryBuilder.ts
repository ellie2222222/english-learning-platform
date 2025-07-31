import { IQuery, OrderType, SortByType } from "../interfaces/others/IQuery";

export const buildQuery = (queryParams: any): IQuery => {
  const {
    page = 1,
    size = 10,
    search,
    sortBy,
    order = "asc",
  } = queryParams;

  return {
    page: parseInt(page as string, 10),
    size: parseInt(size as string, 10),
    search: search as string,
    sortBy: sortBy as SortByType,
    order: order as OrderType,
  };
}; 