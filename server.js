/*const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("WebSocket server running on ws://localhost:3001");*/

const WebSocket = require("ws");
const PORT = process.env.PORT || 3001;

const wss = new WebSocket.Server({ port: PORT });

console.log("Server running on port", PORT);

const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    const { type, room } = data;

    if (!rooms[room]) {
      rooms[room] = [];
    }

    if (!rooms[room].includes(ws)) {
      rooms[room].push(ws);
    }

    ws.room = room;

    // forward to other peer in same room
    rooms[room].forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on("close", () => {
    const room = ws.room;
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(c => c !== ws);
    }
  });
});

console.log("Server running on port", PORT);