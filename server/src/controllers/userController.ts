import { Request, Response } from 'express';
import { INR_BALANCES, resetInrbalance, resetStockbalance, STOCK_BALANCES } from '../models/balances';
import { INRBalance } from '../types/balances';
import { ORDERBOOK, resetOrderbook } from '../models/orderbook';

export const createUser = (req: Request, res: Response) => {
    const { userId } = req.params;
    if (INR_BALANCES[userId]) {
        return res.status(400).json({ error: 'User already exists' });
    }
    INR_BALANCES[userId] = { balance: 0, locked: 0 } as INRBalance;
    STOCK_BALANCES[userId] = {}
    res.json({ message: `User ${userId} created`, balance: INR_BALANCES[userId] });
};

export const getINRBalance = (req: Request, res: Response) => {
    res.json({ INR_BALANCES });
};

export const getIndividualBalance = (req: Request, res: Response) => {
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


export const resetAll = (req:Request, res:Response) => {
    resetOrderbook()
    resetInrbalance()
    resetStockbalance()

    res.json({message:"Orderbook, stock balances and inr balances resetted successfully"})
}