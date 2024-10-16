import express from 'express';
import someRoutes from './routes/routes'
import { WebSocket, WebSocketServer } from 'ws';
import { ORDERBOOK } from './models/orderbook';

const app = express();

app.use(express.json());

app.use('/',someRoutes)

const port = 3000;
const httpServer = app.listen(port);

const wss = new WebSocketServer({ server: httpServer });

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

    ws.on('message', (message:any) => {
        console.log('Received message:', message.toString());
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

setInterval(broadcastOrderbookUpdate, 5000);  

export default app;
