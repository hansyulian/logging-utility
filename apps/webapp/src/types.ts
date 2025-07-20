import type { Log } from "@apps/common";

export type LogExtended = Log & {
  id: string;
  pinned: boolean;
  hidden: boolean;
  expanded: boolean;
};
