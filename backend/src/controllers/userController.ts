import { Request, Response } from 'express';
import { INR_BALANCES } from '../models/balances';
import { INRBalance } from '../types/balances';

export const createUser = (req: Request, res: Response) => {
    const { userId } = req.params;
    if (INR_BALANCES[userId]) {
        return res.status(400).json({ error: 'User already exists' });
    }
    INR_BALANCES[userId] = { balance: 0, locked: 0 } as INRBalance;
    res.json({ message: `User ${userId} created`, balance: INR_BALANCES[userId] });
};

export const getINRBalance = (req: Request, res: Response) => {
    const { userId } = req.params;
    const balance = INR_BALANCES[userId];
    if (!balance) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ balance });
};

export const onrampINR = (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    if (!INR_BALANCES[userId]) {
        return res.status(404).json({ error: 'User not found' });
    }
    INR_BALANCES[userId].balance += amount;
    res.json({ message: `INR ${amount / 100} added to user ${userId}`, balance: INR_BALANCES[userId] });
};
