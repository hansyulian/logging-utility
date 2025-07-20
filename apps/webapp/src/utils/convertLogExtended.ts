import type { Log } from "@apps/common";
import type { LogExtended } from "../types";
import { hash } from "./hash";

export function convertLogExtened(log: Log): LogExtended {
  return {
    ...log,
    pinned: false,
    hidden: false,
    expanded: false,
    id: hash(JSON.stringify(log.data) + log.timestamp),
  };
}
