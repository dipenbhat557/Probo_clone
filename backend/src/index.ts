import express from 'express';
import userRoutes from './routes/userRoutes';
import stockRoutes from './routes/stockRoutes';
import orderRoutes from './routes/orderRoutes';

const app = express();

app.use(express.json());

app.use('/user', userRoutes);
app.use('/stock', stockRoutes);
app.use('/order', orderRoutes);

const port = 3000;
app.listen(port, () => {
    console.log(`Access at http://localhost:${port}`);
});
