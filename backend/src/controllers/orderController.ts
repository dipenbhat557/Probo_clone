import { Request, Response } from "express";
import { INR_BALANCES, STOCK_BALANCES } from "../models/balances";
import { ORDERBOOK } from "../models/orderbook";
import { initializeStockBalance, validateOrder } from "../utils/validation";

// Buy 'yes' option
export const buyYesOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price } = req.body;

  if (!validateOrder(userId, stockSymbol, quantity, price, INR_BALANCES)) {
    return res.status(400).json({ error: "Invalid order" });
  }

  INR_BALANCES[userId].balance -= quantity * price;
  INR_BALANCES[userId].locked += quantity * price;

  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }
  if (!ORDERBOOK[stockSymbol].yes[price]) {
    ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
  }
  ORDERBOOK[stockSymbol].yes[price].total += quantity;
  ORDERBOOK[stockSymbol].yes[price].orders[userId] = {
    quantity:
      (ORDERBOOK[stockSymbol].yes[price].orders[userId]?.quantity || 0) +
      quantity,
    orderType: "buy",
  };

  initializeStockBalance(userId, stockSymbol);

  if (STOCK_BALANCES[userId][stockSymbol]?.yes) {
    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
  }

  return res.json({
    message: `Buy order for 'yes' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

// Buy 'no' option
export const buyNoOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price } = req.body;

  if (!validateOrder(userId, stockSymbol, quantity, price, INR_BALANCES)) {
    return res.status(400).json({ error: "Invalid order" });
  }

  INR_BALANCES[userId].balance -= quantity * price;
  INR_BALANCES[userId].locked += quantity * price;

  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }
  if (!ORDERBOOK[stockSymbol].no[price]) {
    ORDERBOOK[stockSymbol].no[price] = { total: 0, orders: {} };
  }
  ORDERBOOK[stockSymbol].no[price].total += quantity;
  ORDERBOOK[stockSymbol].no[price].orders[userId] = {
    quantity:
      (ORDERBOOK[stockSymbol].no[price].orders[userId]?.quantity || 0) +
      quantity,
    orderType: "buy",
  };

  initializeStockBalance(userId, stockSymbol);

  if (STOCK_BALANCES[userId][stockSymbol]?.no) {
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
  }

  return res.json({
    message: `Buy order for 'no' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

// Sell 'yes' option
export const sellYesOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price } = req.body;

  if (STOCK_BALANCES[userId][stockSymbol]?.yes) {
    if (STOCK_BALANCES[userId]?.[stockSymbol]?.yes.quantity < quantity) {
      return res
        .status(400)
        .json({ error: 'Insufficient "yes" stocks to sell' });
    }

    STOCK_BALANCES[userId][stockSymbol].yes.quantity -= quantity;
    STOCK_BALANCES[userId][stockSymbol].yes.locked += quantity;
  }
  if (!ORDERBOOK[stockSymbol].yes[price]) {
    ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
  }
  ORDERBOOK[stockSymbol].yes[price].total += quantity;
  ORDERBOOK[stockSymbol].yes[price].orders[userId] = {
    quantity:
      (ORDERBOOK[stockSymbol].yes[price].orders[userId]?.quantity || 0) +
      quantity,
    orderType: "sell",
  };
  return res.json({
    message: `Sell order for 'yes' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

// Sell 'no' option
export const sellNoOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price } = req.body;

  if (STOCK_BALANCES[userId]?.[stockSymbol]?.no) {
    if (STOCK_BALANCES[userId]?.[stockSymbol]?.no.quantity < quantity) {
      return res
        .status(400)
        .json({ error: 'Insufficient "no" stocks to sell' });
    }

    STOCK_BALANCES[userId][stockSymbol].no.quantity -= quantity;
    STOCK_BALANCES[userId][stockSymbol].no.locked += quantity;
  }

  if (!ORDERBOOK[stockSymbol].no[price]) {
    ORDERBOOK[stockSymbol].no[price] = { total: 0, orders: {} };
  }
  ORDERBOOK[stockSymbol].no[price].total += quantity;
  ORDERBOOK[stockSymbol].no[price].orders[userId] = {
    quantity:
      (ORDERBOOK[stockSymbol].no[price].orders[userId]?.quantity || 0) +
      quantity,
    orderType: "sell",
  };
  return res.json({
    message: `Sell order for 'no' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

export const viewOrderbook = (req: Request, res: Response): Response => {
  const { stockSymbol } = req.params;
  const orderbook = ORDERBOOK[stockSymbol];

  if (!orderbook) {
    return res.status(404).json({ error: "Orderbook not found for symbol" });
  }

  return res.json(orderbook);
};
