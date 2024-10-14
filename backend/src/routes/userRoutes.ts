import { Router } from 'express';
import { createUser, getIndividualBalance, getINRBalance, onrampINR } from '../controllers/userController';

const router: Router = Router();

router.post('/create/:userId', createUser);
router.get('/balances/inr', getINRBalance);
router.get('/balance/inr/:userId', getIndividualBalance)
router.post('/onramp/inr', onrampINR);

export default router;
