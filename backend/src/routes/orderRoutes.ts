import { Router } from 'express';
import { buyNoOption, buyYesOption, sellNoOption, sellYesOption, viewIndividualOrderbook, viewOrderbook } from '../controllers/orderController';

const router: Router = Router();

router.get('/orderbook', viewOrderbook);
router.get('/orderbook/:stockSymbol',viewIndividualOrderbook)

export default router;
