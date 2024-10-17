import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { createClient } from "redis";

const app = express();
const httpServer = app.listen(8080);
const wss = new WebSocketServer({ server: httpServer });
const redisClient = createClient();
const redisPublisher = createClient();

const subscriptions = new Map<string, WebSocket>();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message: WebSocket.RawData) => {
    const messageString = typeof message === "string" ? message : message.toString();

    const data = JSON.parse(messageString); 

    if (data.type === "subscribe") {
      const { stockSymbol } = data;

      if (!subscriptions.has(stockSymbol)) {
        subscriptions.set(stockSymbol, ws);
        
        await redisClient.subscribe(`orderbook.${stockSymbol}`, (message) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            console.log(`Sent update for ${stockSymbol}:`, message);
          }
        });

        console.log(`Subscribed to orderbook.${stockSymbol}`);
      } else {
        console.log(`Already subscribed to orderbook.${stockSymbol}`);
      }
    }

    if (data.type === "unsubscribe") {
      const { stockSymbol } = data;
      await redisClient.unsubscribe(`orderbook.${stockSymbol}`);
      subscriptions.delete(stockSymbol);
      console.log(`Unsubscribed from orderbook.${stockSymbol}`);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    // Optionally, you can unsubscribe all channels for this client if desired
    for (const stockSymbol of subscriptions.keys()) {
      redisClient.unsubscribe(`orderbook.${stockSymbol}`);
    }
    subscriptions.clear();
  });
});

// Connect to Redis
async function startServer() {
  try {
    await redisClient.connect();
    await redisPublisher.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();

// wss.on('connection', (ws: WebSocket) => {
//     console.log("Client connected");

//     ws.send(JSON.stringify({  orderbook: {} }));

//     ws.on('message', (message)=> {
//         const data = JSON.stringify({
//             orderbook: message.toString()
//         });

//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(data);
//             }
//         });
//     });

//     ws.on('close', () => {
//         console.log("Client disconnected");
//     });
// });
