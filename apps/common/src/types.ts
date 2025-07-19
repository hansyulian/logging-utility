export type MessageType = "newLog" | "cleared";

export type SocketMessage = {
  timestamp: string;
  type: MessageType;
  data: object;
};

export type Log = {
  timestamp: string;
  data: object;
};
