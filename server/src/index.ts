import express from "express";
import someRoutes from "./routes/routes";
import { WebSocket } from "ws";
import { createClient } from "redis";

const app = express();
export const redisClient = createClient();
export const requestQueue = "requestQueue";
export const responseQueue = "responseQueue";

app.use(express.json());

app.use("/", someRoutes);

export const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to the websocket Hurrayyy!!");
});

ws.on("message", (message) => {
  const data = JSON.parse(message.toString());
  console.log("Parsed data:", data);
});

ws.on("close", () => {
  console.log("Connection closed successfully");
});

async function startServer() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();
