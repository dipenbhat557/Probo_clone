import { STOCK_BALANCES } from "../models/balances";
import { INRBalance } from "../types/balances";

export const validateOrder = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  INR_BALANCES: Record<string, INRBalance>
): boolean => {
  if (!INR_BALANCES[userId]) return false;
  if (INR_BALANCES[userId].balance < quantity * price || price <= 0)
    return false;
  return true;
};

export const initializeStockBalance = (userId: string, stockSymbol: string) => {
  if (!STOCK_BALANCES[userId]) {
    STOCK_BALANCES[userId] = {};
  }
  if (!STOCK_BALANCES[userId][stockSymbol]) {
    STOCK_BALANCES[userId][stockSymbol] = {
      yes: { quantity: 0, locked: 0 },
      no: { quantity: 0, locked: 0 },
    };
  }
};
