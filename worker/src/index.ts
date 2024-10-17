import express from "express";
import { createClient } from "redis";
import { ORDERBOOK } from "./models/orderbook";
import { processOrder } from "./utils";

const app = express();
export const redisClient = createClient();
export const publisher = createClient()
export const requestQueue = "requestQueue";
// export const responseQueue = "responseQueue";

async function publishAllOrderbooks() {
  for (const stockSymbol in ORDERBOOK) {
    const channel = `orderbook.${stockSymbol}`;
    await redisClient.publish(channel, JSON.stringify(ORDERBOOK[stockSymbol]));
    console.log(`Published orderbook for ${stockSymbol} to ${channel}`);
  }
}

async function pollQueue() {
  
  const data = await redisClient.brPop(requestQueue, 0);
  console.log("request to the queue data is ", data?.element);

  await processOrder(JSON.parse(data!.element));

  await publishAllOrderbooks()
  
  pollQueue();
}

async function startServer() {
  try {
    await redisClient.connect();
    await publisher.connect()
    publishAllOrderbooks()
    console.log("Connected to Redis");

    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();

pollQueue();
