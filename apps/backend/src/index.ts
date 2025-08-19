import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dayjs from "dayjs";
import http from "http";
import { WebSocketServer } from "ws";
import { Log, wait } from "@apps/common";
import { appConfig } from "./config/app";

const app = express();
let logs: Log[] = [];
app.use(express.json());
app.use(cors());

// Create HTTP server to attach WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const wsState = new WeakMap();

wss.on("connection", (ws) => {
  console.log(`Client connected, total clients ${wss.clients.size}`);

  ws.on("message", (message) => {
    if (verifyServerKey(message.toString())) {
      wsState.set(ws, { isAuthenticated: true });
    }
    console.log("Received message:", message.toString());
  });
  ws.on("close", () => {
    console.log(`Client disconnected, total clients ${wss.clients.size}`);
  });
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

type MessageType = "newLog" | "cleared";

function broadcastMessage(type: MessageType, data: object) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  });
  wss.clients.forEach((client) => {
    if (client.readyState !== 1) {
      return;
    }
    if (!wsState.get(client)?.isAuthenticated) {
      return;
    }

    client.send(message);
  });
}

function broadcastClear() {
  broadcastMessage("cleared", {});
}

function broadcastLog(data: object) {
  broadcastMessage("newLog", data);
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const queryServerKey = req.query.serverKey;
  const bodyServerKey = req.body?.serverKey;
  const headerServerKey = req.headers["server-key"];
  const serverKey = queryServerKey || bodyServerKey || headerServerKey;
  if (req.body) {
    delete req.body.serverKey;
  }
  if (!serverKey) {
    res.status(404).send();
    return;
  }
  if (!verifyServerKey(serverKey)) {
    res.status(404).send();
    return;
  }
  next();
});

app.post("/", (req: Request, res: Response) => {
  const data = req.body;
  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const log = {
    timestamp,
    data,
  };
  logs.unshift(log);

  // Send log to all connected WebSocket clients
  broadcastLog(data);
  console.log(`${timestamp}: ${JSON.stringify(data, null, 2)}`);
  res.sendStatus(200);
});

app.post("/clear", (req: Request, res: Response) => {
  logs = [];
  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
  // Send log to all connected WebSocket clients
  broadcastClear();
  console.log(`${timestamp}: cleared`);
  res.sendStatus(200);
});

app.get("/", (req: Request, res: Response) => {
  res.json(logs.slice(0, 100));
});

// Start HTTP + WebSocket server
server.listen(9952, () => {
  console.log("Server started on port 9952 with WebSocket support");
});

function verifyServerKey(serverKey: string) {
  return serverKey === appConfig.serverKey;
}

async function logClearCron() {
  const untilMidnight = dayjs()
    .add(1, "day")
    .startOf("day")
    .diff(dayjs(), "millisecond");
  await wait(untilMidnight);
  broadcastClear();
  await wait(1000);
  logClearCron();
}

logClearCron();
