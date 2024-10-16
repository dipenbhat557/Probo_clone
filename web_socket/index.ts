import WebSocket, { WebSocketServer } from 'ws';
import express from "express"

const app = express()
const httpServer = app.listen(8080)
const wss = new WebSocketServer({ server: httpServer });

let ORDERBOOK: any = {}; 

wss.on('connection', (ws: WebSocket) => {
    console.log("Client connected");

    ws.send(JSON.stringify({  orderbook: {} }));

    ws.on('message', (message, isBinary) => {
        const data = JSON.stringify({
            orderbook: message
        });
    
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data,{binary:isBinary});
            }
        });
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

