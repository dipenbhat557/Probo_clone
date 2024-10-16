import express from 'express';
import someRoutes from './routes/routes'

const app = express();

app.use(express.json());

app.use('/',someRoutes)

const port = 3000;
app.listen(port, () => {
    console.log(`Access at http://localhost:${port}`);
});

export default app;
