import { Router } from 'express';
import { buyNoOption, buyYesOption, sellNoOption, sellYesOption, viewOrderbook } from '../controllers/orderController';

const router: Router = Router();

router.post('/buy/yes', buyYesOption);
router.post('/buy/no',buyNoOption)
router.post('/sell/yes',sellYesOption)
router.post('/sell/no',sellNoOption)
router.get('/orderbook', viewOrderbook);

export default router;
