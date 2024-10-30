import express from "express";
import someRoutes from "./routes/routes";
import { WebSocket } from "ws";
import { createClient } from "redis";

const app = express();
export const redisClient = createClient();
export const subscriber = createClient();
export const requestQueue = "requestQueue";
// export const responseQueue = "responseQueue";

app.use(express.json());

app.use("/", someRoutes);

async function startServer() {
  try {
    await redisClient.connect();
    await subscriber.connect();
    console.log("Connected to Redis");

    app.listen(3005, () => {
      console.log("Server is running on port 3005");
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();
