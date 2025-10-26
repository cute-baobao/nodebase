import { PAGINATION } from "@/lib/configs/constants";
import { parseAsInteger, parseAsString } from "nuqs/server";

export const workflowsParams = {
  page: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE).withOptions({
    clearOnDefault: true,
  }),
  pageSize: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE_SIZE).withOptions({
    clearOnDefault: true,
  }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};
