import WebSocket, { WebSocketServer } from 'ws';
import express from "express"
import redis from 'redis'

const app = express()
const httpServer = app.listen(8080)
const wss = new WebSocketServer({ server: httpServer });
const redisClient = redis.createClient();
const responseQueue = 'responseQueue'


wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    
    async function pollQueue() {
        const data = await redisClient.brPop(responseQueue, 0)

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data?.element));
                }
            });

            pollQueue();
    }

    pollQueue();
});


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

