import { Request, Response } from "express";
import { INR_BALANCES, STOCK_BALANCES } from "../models/balances";
import { ORDERBOOK } from "../models/orderbook";
import { initializeStockBalance, validateOrder } from "../utils/validation";

const mintOppositeStock = (
  stockSymbol: string,
  price: number,
  quantity: number,
  userId: number | string,
  orderType: "yes" | "no"
) => {
  const oppositePrice = 10 - price;

  if (orderType === "yes") {
    if (!ORDERBOOK[stockSymbol].no[oppositePrice]) {
      ORDERBOOK[stockSymbol].no[oppositePrice] = { total: 0, orders: {} };
    }
    ORDERBOOK[stockSymbol].no[oppositePrice].total += quantity;
    ORDERBOOK[stockSymbol].no[oppositePrice].orders[userId] =
      (ORDERBOOK[stockSymbol].no[oppositePrice].orders[userId] || 0) + quantity;
  } else {
    if (!ORDERBOOK[stockSymbol].yes[oppositePrice]) {
      ORDERBOOK[stockSymbol].yes[oppositePrice] = { total: 0, orders: {} };
    }
    ORDERBOOK[stockSymbol].yes[oppositePrice].total += quantity;
    ORDERBOOK[stockSymbol].yes[oppositePrice].orders[userId] =
      (ORDERBOOK[stockSymbol].yes[oppositePrice].orders[userId] || 0) +
      quantity;
  }
};

export const buyYesOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price: originalPrice } = req.body;
  const price = originalPrice / 100;

  if (!validateOrder(userId, stockSymbol, quantity, price, INR_BALANCES)) {
    return res.status(400).json({ error: "Invalid order" });
  }

  INR_BALANCES[userId].balance -= quantity * price;
  INR_BALANCES[userId].locked += quantity * price;

  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }

  let availableQuantity = 0;
  let availableNoQuantity = 0;
  if (ORDERBOOK[stockSymbol].yes[price]) {
    availableQuantity = ORDERBOOK[stockSymbol].yes[price].total;
    availableNoQuantity = ORDERBOOK[stockSymbol].no[10 - price]?.total;
  }

  let tempQuantity = quantity;

  if (availableQuantity > 0) {
    for (let user in ORDERBOOK[stockSymbol].yes[price].orders) {
      if (tempQuantity <= 0) break;

      const available = ORDERBOOK[stockSymbol].yes[price].orders[user];
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].yes[price].orders[user] -= toTake;
      ORDERBOOK[stockSymbol].yes[price].total -= toTake;
      tempQuantity -= toTake;

      if (ORDERBOOK[stockSymbol].yes[price].orders[user] === 0) {
        delete ORDERBOOK[stockSymbol].yes[price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].yes[price].total === 0) {
      delete ORDERBOOK[stockSymbol].yes[price];
    }
  }

  if (availableNoQuantity > 0 && ORDERBOOK[stockSymbol].no[10-price]) {
    for (let user in ORDERBOOK[stockSymbol].no[10 - price].orders) {
      if (tempQuantity <= 0) break;

      const available = ORDERBOOK[stockSymbol].no[10 - price].orders[user];
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].no[10 - price].orders[user] -= toTake;
      ORDERBOOK[stockSymbol].no[10 - price].total -= toTake;
      tempQuantity -= toTake;

      if (ORDERBOOK[stockSymbol].no[10 - price].orders[user] === 0) {
        delete ORDERBOOK[stockSymbol].no[10 - price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].no[10 - price].total === 0) {
      delete ORDERBOOK[stockSymbol].no[10 - price];
    }
  }

  if (tempQuantity > 0) {
    mintOppositeStock(stockSymbol, price, tempQuantity, userId, "yes");
  }

  initializeStockBalance(userId, stockSymbol);

  if (STOCK_BALANCES[userId][stockSymbol]?.yes) {
    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity - tempQuantity;
  }

  INR_BALANCES[userId].locked -= ((quantity - tempQuantity) * price);

  return res.json({
    message: `Buy order for 'yes' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

export const buyNoOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price: originalPrice } = req.body;
  const price = originalPrice / 100;

  if (!validateOrder(userId, stockSymbol, quantity, price, INR_BALANCES)) {
    return res.status(400).json({ error: "Invalid order" });
  }

  INR_BALANCES[userId].balance -= quantity * price;
  INR_BALANCES[userId].locked += quantity * price;

  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }

  let availableQuantity = 0;
  let availableYesQuantity = 0;
  if (ORDERBOOK[stockSymbol].no[price]) {
    availableQuantity = ORDERBOOK[stockSymbol].no[price].total;
    availableYesQuantity = ORDERBOOK[stockSymbol].yes[10-price]?.total
  }

  let tempQuantity = quantity;

  if (availableQuantity > 0) {
    for (let user in ORDERBOOK[stockSymbol].no[price].orders) {
      if (tempQuantity <= 0) break;

      const available = ORDERBOOK[stockSymbol].no[price].orders[user];
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].no[price].orders[user] -= toTake;
      ORDERBOOK[stockSymbol].no[price].total -= toTake;
      tempQuantity -= toTake;

      if (ORDERBOOK[stockSymbol].no[price].orders[user] === 0) {
        delete ORDERBOOK[stockSymbol].no[price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].no[price].total === 0) {
      delete ORDERBOOK[stockSymbol].no[price];
    }
  }

  if (availableYesQuantity > 0 && ORDERBOOK[stockSymbol].yes[10-price]) {
    for (let user in ORDERBOOK[stockSymbol].yes[10-price].orders) {
      if (tempQuantity <= 0) break;

      const available = ORDERBOOK[stockSymbol].yes[10-price].orders[user];
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].yes[10-price].orders[user] -= toTake;
      ORDERBOOK[stockSymbol].yes[10-price].total -= toTake;
      tempQuantity -= toTake;

      if (ORDERBOOK[stockSymbol].yes[10-price].orders[user] === 0) {
        delete ORDERBOOK[stockSymbol].yes[10-price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].yes[10-price].total === 0) {
      delete ORDERBOOK[stockSymbol].yes[10-price];
    }
  }

  if (tempQuantity > 0) {
    mintOppositeStock(stockSymbol, price, tempQuantity, userId, "no");
  }

  initializeStockBalance(userId, stockSymbol);

  if (STOCK_BALANCES[userId][stockSymbol]?.no) {
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity - tempQuantity;
  }
  
  INR_BALANCES[userId].locked -= ((quantity - tempQuantity) * price);

  return res.json({
    message: `Buy order for 'no' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

export const sellYesOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price: originalPrice } = req.body;
  const price = originalPrice / 100;

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
  ORDERBOOK[stockSymbol].yes[price].orders[userId] =
    (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;
  return res.json({
    message: `Sell order for 'yes' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

export const sellNoOption = (req: Request, res: Response): Response => {
  const { userId, stockSymbol, quantity, price: originalPrice } = req.body;
  const price = originalPrice / 100;

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
  ORDERBOOK[stockSymbol].no[price].orders[userId] =
    (ORDERBOOK[stockSymbol].no[price].orders[userId] || 0) + quantity;
  return res.json({
    message: `Sell order for 'no' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
};

export const viewOrderbook = (req: Request, res: Response): Response => {
  return res.json(ORDERBOOK);
};

export const viewIndividualOrderbook = (
  req: Request,
  res: Response
): Response => {
  const { stockSymbol } = req.params;
  const orderbook = ORDERBOOK[stockSymbol];

  if (!orderbook) {
    return res
      .status(404)
      .json({ error: "Orderbook with provided stock symbol not found" });
  }

  return res.json(orderbook);
};
