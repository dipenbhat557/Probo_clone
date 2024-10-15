import express, { Router } from 'express';
import userRoutes from './routes/userRoutes';
import stockRoutes from './routes/stockRoutes';
import orderRoutes from './routes/orderRoutes';
import someRoutes from './routes/routes'

const app = express();

app.use(express.json());

const router: Router = Router();

app.use('/',someRoutes)
app.use('/user', userRoutes);
app.use('/stock', stockRoutes);
app.use('/order', orderRoutes);

const port = 3000;
app.listen(port, () => {
    console.log(`Access at http://localhost:${port}`);
});

export default app;
