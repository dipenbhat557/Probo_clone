import express from 'express'
import redis from 'redis';

const redisClient = redis.createClient();
const requestQueue = 'requestQueue';
const responseQueue = 'responseQueue';

function processOrder(orderData:any) {
    const processedData = { ...orderData, processed: true };
    return processedData;
}

async function pollQueue() {
    const data = await redisClient.brPop(requestQueue, 0);

    const response = processOrder(data?.element)

    await redisClient.lPush(requestQueue, JSON.stringify(response))
    pollQueue();
}

pollQueue();
