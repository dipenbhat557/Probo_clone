import { Router } from 'express';
import { createSymbol, getStockBalance } from '../controllers/stockController';

const router = Router();

router.get('/create/:stockSymbol', createSymbol);
router.get('/balance/:userId', getStockBalance);

export default router;
