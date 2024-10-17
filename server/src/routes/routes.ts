import { Router } from "express";
import { createUser, getIndividualBalance, getINRBalance, onrampINR, resetAll } from "../controllers/userController";
import { createSymbol, getIndividualStockBalance, getStockBalance, mintTrade } from "../controllers/stockController";
import { buyOption, sellOption, viewIndividualOrderbook, viewOrderbook } from "../controllers/orderController";

const router: Router = Router();

router.post('/user/create/:userId',createUser)
router.post('/symbol/create/:stockSymbol',createSymbol)
router.get('/orderbook',viewOrderbook)
router.get('/balances/inr',getINRBalance)
router.get('/balances/stock',getStockBalance)
router.post('/reset',resetAll)
router.get('/balance/inr/:userId',getIndividualBalance)
router.post('/onramp/inr',onrampINR)
router.get('/balance/stock/:userId',getIndividualStockBalance)
router.post('/order/buy',buyOption)
router.post('/order/sell',sellOption)
router.get('/orderbook/:stockSymbol',viewIndividualOrderbook)
router.post('/trade/mint',mintTrade)

export default router;