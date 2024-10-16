import WebSocket, { WebSocketServer } from 'ws';
import express from "express"

const app = express()
const httpServer = app.listen(8080)
const wss = new WebSocketServer({ server: httpServer });

let ORDERBOOK: any = {}; 

const broadcastOrderbookUpdate = () => {
    const data = JSON.stringify({
        type: "orderbook_update",
        orderbook: ORDERBOOK
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', (ws: WebSocket) => {
    console.log("Client connected");

    ws.send(JSON.stringify({ type: "initial_orderbook", orderbook: ORDERBOOK }));

    ws.on('message', (message) => {
        console.log('Received message:', message.toString());
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

const onOrderbookChange = () => {
    ORDERBOOK = {
        yes: {
            100: {
                total: 10,
                orders: {
                    user1: {
                        type: "buy",
                        quantity: 10
                    }
                }
            }
        },
        no: {
            90: {
                total: 5,
                orders: {
                    user2: {
                        type: "sell",
                        quantity: 5
                    }
                }
            }
        }
    };

    broadcastOrderbookUpdate();
};

setInterval(onOrderbookChange, 5000);  
