import "server-only";

import { userQueries } from "./data/users";
import { studentQueries } from "./data/students";
import { logQueries } from "./data/logs";
import { messageQueries } from "./data/messages";

export * from "./data/types";

// Single entry point used by pages and Server Actions
export const dataService = {
  ...userQueries,
  ...studentQueries,
  ...logQueries,
  ...messageQueries,
};
