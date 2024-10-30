import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { createClient } from "redis";

const app = express();
const httpServer = app.listen(8085);
const wss = new WebSocketServer({ server: httpServer });
const redisClient = createClient();
const redisPublisher = createClient();

const subscriptions = new Map<string, (message: string, channel: string) => void>();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message: WebSocket.RawData) => {
    const messageString = typeof message === "string" ? message : message.toString();
    const data = JSON.parse(messageString); 

    if (data.type === "subscribe") {
      const { stockSymbol } = data;

      if (!subscriptions.has(stockSymbol)) {
        const listener = (message: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            const data = {
              event: `event_orderbook_update`,
              message
            }
            ws.send(JSON.stringify(data));
            console.log(`Sent update for ${stockSymbol}:`, JSON.stringify(data));
          }
        };

        await redisClient.subscribe(`orderbook.${stockSymbol}`, listener);
        subscriptions.set(stockSymbol, listener);

        console.log(`Subscribed to orderbook.${stockSymbol}`);
      } else {
        console.log(`Already subscribed to orderbook.${stockSymbol}`);
      }
    }

    if (data.type === "unsubscribe") {
      const { stockSymbol } = data;
      const listener = subscriptions.get(stockSymbol);
      if (listener) {
        await redisClient.unsubscribe(`orderbook.${stockSymbol}`, listener);
        subscriptions.delete(stockSymbol);
        console.log(`Unsubscribed from orderbook.${stockSymbol}`);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    for (const stockSymbol of subscriptions.keys()) {
      const listener = subscriptions.get(stockSymbol);
      if (listener) {
        redisClient.unsubscribe(`orderbook.${stockSymbol}`, listener);
      }
    }
    subscriptions.clear();
  });
});

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