
type MessageType = 'newLog' | 'cleared';

export type SocketMessage = {
  timestamp: string;
  type: MessageType;
  data: any;
}

export type Log = {
  timestamp: string;
  data: any;
}