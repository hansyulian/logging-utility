import express, { Request, Response } from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
let logs: any[] = [];
app.use(express.json());
app.use(cors());

// Create HTTP server to attach WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log(`Client connected, total clients ${wss.clients.size}`);

  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
  });
  ws.on('close', () => {
    console.log(`Client disconnected, total clients ${wss.clients.size}`);
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

type MessageType = 'newLog' | 'cleared';

function broadcastMessage(type: MessageType, data: object) {
  const message = JSON.stringify({ type, data, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss') });
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
}

function broadcastClear() {
  broadcastMessage('cleared', {});
}

function broadcastLog(data: object) {
  broadcastMessage('newLog', data);
}

app.post('/', (req: Request, res: Response) => {
  const data = req.body;
  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const log = {
    timestamp,
    data,
  };
  logs.unshift(log);

  // Send log to all connected WebSocket clients
  broadcastLog(data);
  console.log(`${timestamp}: ${JSON.stringify(data, null, 2)}`)
  res.sendStatus(200);
});

app.post('/clear', (req: Request, res: Response) => {
  logs = [];
  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  // Send log to all connected WebSocket clients
  broadcastClear();
  console.log(`${timestamp}: cleared`)
  res.sendStatus(200);
});

app.get('/', (req: Request, res: Response) => {
  res.json(logs.slice(0, 100));
});

// Start HTTP + WebSocket server
server.listen(9952, () => {
  console.log('Server started on port 9952 with WebSocket support');
});
