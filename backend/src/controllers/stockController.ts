import { Request, Response } from 'express';
import { STOCK_BALANCES } from '../models/balances';
import { StockBalance } from '../types/balances';
import { ORDERBOOK } from '../models/orderbook';

export const createSymbol = (req: Request, res: Response): Response => {
    const { stockSymbol } = req.params;

    const defaultStockBalance: StockBalance = {
        yes: {
            quantity: 0,
            locked: 0
        },
        no: {
            quantity: 0,
            locked: 0
        }
    };

    Object.keys(STOCK_BALANCES).forEach(userId => {
        STOCK_BALANCES[userId][stockSymbol] = { ...defaultStockBalance };
    });

    return res.status(201).json({ message: `Symbol ${stockSymbol} created successfully.` });
};


export const getStockBalance = (req: Request, res: Response) => {
    res.json(STOCK_BALANCES);
};

export const getIndividualStockBalance = (req: Request, res: Response) => {
    const { userId } = req.params;
    const stock = STOCK_BALANCES[userId];
    if (!stock) {
        return res.status(404).json({ error: 'User not found or no stock balance available' });
    }
    res.json(stock);
};

export const mintTrade = (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity } = req.body;

    ORDERBOOK[stockSymbol].yes[5].total += quantity;
    ORDERBOOK[stockSymbol].yes[5].orders[userId] = (ORDERBOOK?.[stockSymbol]?.yes[5]?.orders[userId] || 0) + quantity;
    
    ORDERBOOK[stockSymbol].no[5].total += quantity;
    ORDERBOOK[stockSymbol].no[5].orders[userId] = (ORDERBOOK?.[stockSymbol]?.no[5]?.orders[userId] || 0) + quantity;

    return res.json(ORDERBOOK?.[stockSymbol]);
}