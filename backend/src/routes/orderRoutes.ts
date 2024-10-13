import { Router } from 'express';
import { buyYesOption, viewOrderbook } from '../controllers/orderController';

const router: Router = Router();

router.post('/buy/yes', buyYesOption);
router.get('/orderbook/:stockSymbol', viewOrderbook);

export default router;
