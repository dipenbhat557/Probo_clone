import { Router } from "express";
import { buyOption, createSymbol, createUser, getIndividualBalance, getIndividualStockBalance, getINRBalance, getStockBalance, mintTrade, onrampINR, resetAll, sellOption, viewIndividualOrderbook, viewOrderbook } from "../utils";

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