import { Router } from 'express';
import { createSymbol, getIndividualStockBalance, getStockBalance } from '../controllers/stockController';

const router = Router();

router.post('/create/:stockSymbol', createSymbol);
router.get('/balances/stock', getStockBalance);
router.get('/balance/stock/:userId', getIndividualStockBalance)

export default router;
