import express from 'express';
import someRoutes from './routes/routes'
import { WebSocket} from 'ws';

const app = express();

app.use(express.json());

app.use('/',someRoutes)

const port = 3000;
app.listen(port);

export const ws = new WebSocket("ws://localhost:8080")

ws.on("open", ()=>{
    console.log("Connected to the websocket Hurrayyy!!")
})

ws.on("message", (message) => {
    const data = JSON.parse(message.toString());  
    console.log("Parsed data:", data);
});

ws.on("close",()=>{
    console.log("Connection closed successfully")
})