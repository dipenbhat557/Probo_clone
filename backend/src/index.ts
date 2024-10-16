import express from 'express';
import someRoutes from './routes/routes'

const app = express();

app.use(express.json());

app.use('/',someRoutes)

const port = 3000;
app.listen(port, () => {
    console.log(`Access at http://localhost:${port}`);
    const a = {
        yes: {
            quantity: 0,
            locked: 0
        },
        no: {
            quantity: 0,
            locked: 0
        }
    };
    
    const b = {
        yes: {
            quantity: 0,
            locked: 0
        },
        no: {
            quantity: 0,
            locked: 0
        }
    };
    
    a.yes.quantity += 1
    console.log(b.yes.quantity);
});

export default app;
