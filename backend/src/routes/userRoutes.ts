import { Router } from 'express';
import { createUser, getINRBalance, onrampINR } from '../controllers/userController';

const router: Router = Router();

router.get('/create/:userId', createUser);
router.get('/balance/inr/:userId', getINRBalance);
router.post('/onramp/inr', onrampINR);

export default router;
