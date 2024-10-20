import { Response } from "express";
import { INR_BALANCES, STOCK_BALANCES } from "../models/balances";
import { ORDERBOOK } from "../models/orderbook";
import { INRBalance } from "../types/balances";

export const validateOrder = (
  userId: string,
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

export const mintOppositeStock = (
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
    ORDERBOOK[stockSymbol].no[oppositePrice].orders[userId] = {
      type: "reverted",
      quantity:
        (ORDERBOOK[stockSymbol].no[oppositePrice].orders[userId]?.quantity ||
          0) + quantity,
    };
  } else {
    if (!ORDERBOOK[stockSymbol].yes[oppositePrice]) {
      ORDERBOOK[stockSymbol].yes[oppositePrice] = { total: 0, orders: {} };
    }
    ORDERBOOK[stockSymbol].yes[oppositePrice].total += quantity;
    ORDERBOOK[stockSymbol].yes[oppositePrice].orders[userId] = {
      type: "reverted",
      quantity:
        (ORDERBOOK[stockSymbol].yes[oppositePrice].orders[userId]?.quantity ||
          0) + quantity,
    };
  }
};

export const buyYesOption = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  if (!validateOrder(userId, quantity, price, INR_BALANCES)) {
    return { error: "Invalid order" };
  }

  INR_BALANCES[userId].balance -= quantity * price * 100;
  INR_BALANCES[userId].locked += quantity * price * 100;

  if (!ORDERBOOK[stockSymbol]) {
    return { msg: "Invalid stock symbol" };
  }

  let availableQuantity = 0;
  let availableNoQuantity = 0;
  if (ORDERBOOK[stockSymbol].yes[price]) {
    availableQuantity = ORDERBOOK[stockSymbol].yes[price].total;
    availableNoQuantity = ORDERBOOK[stockSymbol].no[10 - price]?.total || 0;
  }

  console.log("available quant is ", availableQuantity)
  console.log("availabel no quant is ",availableNoQuantity)

  let tempQuantity = quantity;

  if (availableQuantity > 0) {
    for (let user in ORDERBOOK[stockSymbol].yes[price].orders) {
      if (tempQuantity <= 0) break;

      const available = ORDERBOOK[stockSymbol].yes[price].orders[user].quantity;
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].yes[price].orders[user].quantity -= toTake;
      ORDERBOOK[stockSymbol].yes[price].total -= toTake;
      console.log("tempquant before ", tempQuantity)
      tempQuantity -= toTake;
      console.log("tempquant after ",tempQuantity)

      if (ORDERBOOK[stockSymbol].yes[price].orders[user].type == "sell") {
        if (STOCK_BALANCES[user][stockSymbol].yes) {
          STOCK_BALANCES[user][stockSymbol].yes.locked -= toTake;
          INR_BALANCES[user].balance += toTake * price * 100;
        }
      } else if (
        ORDERBOOK[stockSymbol].yes[price].orders[user].type == "reverted"
      ) {
        if (STOCK_BALANCES[user][stockSymbol].no) {
          STOCK_BALANCES[user][stockSymbol].no.quantity += toTake;
          INR_BALANCES[user].locked -= toTake * price*100;
        }
      }

      if (ORDERBOOK[stockSymbol].yes[price].orders[user].quantity === 0) {
        delete ORDERBOOK[stockSymbol].yes[price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].yes[price].total === 0) {
      delete ORDERBOOK[stockSymbol].yes[price];
    }
  }

  if (availableNoQuantity > 0 && ORDERBOOK[stockSymbol].no[10 - price]) {
    for (let user in ORDERBOOK[stockSymbol].no[10 - price].orders) {
      if (tempQuantity <= 0) break;

      const available =
        ORDERBOOK[stockSymbol].no[10 - price].orders[user].quantity;
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].no[10 - price].orders[user].quantity -= toTake;
      ORDERBOOK[stockSymbol].no[10 - price].total -= toTake;
      console.log("tempquant before in no ", tempQuantity)
      tempQuantity -= toTake;
      console.log("tempquant after in no ",tempQuantity)

      if (ORDERBOOK[stockSymbol].no[10 - price].orders[user].type == "sell") {
        if (STOCK_BALANCES[user][stockSymbol].no) {
          STOCK_BALANCES[user][stockSymbol].no.locked -= toTake;
          INR_BALANCES[user].balance += toTake * (10 - price) * 100;
        }
      } else if (
        ORDERBOOK[stockSymbol].no[10 - price].orders[user].type == "reverted"
      ) {
        if (STOCK_BALANCES[user][stockSymbol].yes) {
          STOCK_BALANCES[user][stockSymbol].yes.quantity += toTake;
          INR_BALANCES[user].locked -= toTake * (10 - price) * 100;
        }
      }

      if (ORDERBOOK[stockSymbol].no[10 - price].orders[user].quantity === 0) {
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

  INR_BALANCES[userId].locked -= (quantity - tempQuantity) * price * 100;

  return {
    message: `Buy order for 'yes' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  };
};

export const buyNoOption = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  if (!validateOrder(userId, quantity, price, INR_BALANCES)) {
    return { error: "Invalid order" };
  }

  INR_BALANCES[userId].balance -= quantity * price * 100;
  INR_BALANCES[userId].locked += quantity * price * 100;

  if (!ORDERBOOK[stockSymbol]) {
    return { msg: "Invalid stock symbol" };
  }

  let availableQuantity = 0;
  let availableYesQuantity = 0;
  if (ORDERBOOK[stockSymbol].no[price]) {
    availableQuantity = ORDERBOOK[stockSymbol].no[price].total;
    availableYesQuantity = ORDERBOOK[stockSymbol].yes[10 - price]?.total || 0;
  }

  console.log("availabe quantity is ",availableQuantity)
  console.log("available yea quant is ",availableYesQuantity)

  let tempQuantity = quantity;

  if (availableQuantity > 0) {
    for (let user in ORDERBOOK[stockSymbol].no[price].orders) {
      if (!STOCK_BALANCES[userId]) {
        STOCK_BALANCES[userId] = {};
      }

      if (!STOCK_BALANCES[user]) {
        STOCK_BALANCES[user] = {};
      }

      if (!STOCK_BALANCES[userId][stockSymbol]) {
        STOCK_BALANCES[userId][stockSymbol] = {
          yes: { quantity: 0, locked: 0 },
          no: { quantity: 0, locked: 0 },
        };
      }

      if (!STOCK_BALANCES[user][stockSymbol]) {
        STOCK_BALANCES[user][stockSymbol] = {
          yes: { quantity: 0, locked: 0 },
          no: { quantity: 0, locked: 0 },
        };
      }

      if (tempQuantity <= 0) break;

      const available = ORDERBOOK[stockSymbol].no[price].orders[user].quantity;
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].no[price].orders[user].quantity -= toTake;
      ORDERBOOK[stockSymbol].no[price].total -= toTake;
      tempQuantity -= toTake;

      if (ORDERBOOK[stockSymbol].no[price].orders[user].type == "sell") {
        if (STOCK_BALANCES[user][stockSymbol].no) {
          STOCK_BALANCES[user][stockSymbol].no.locked -= toTake;
          INR_BALANCES[user].balance += toTake * 100 * price;
        }
      } else if (
        ORDERBOOK[stockSymbol].no[price].orders[user].type == "reverted"
      ) {
        console.log(JSON.stringify(STOCK_BALANCES));
        if (STOCK_BALANCES[userId][stockSymbol].yes) {
          console.log(
            "stock balance of yes actual before ",
            STOCK_BALANCES[userId][stockSymbol].yes.quantity
          );
        }
        if (STOCK_BALANCES[user][stockSymbol].yes) {
          STOCK_BALANCES[user][stockSymbol].yes.quantity += toTake;
          INR_BALANCES[user].locked -= toTake * 100 * price;
          console.log(
            "stock balance of yes ",
            STOCK_BALANCES[user][stockSymbol].yes.quantity
          );
        }
        if (STOCK_BALANCES[userId][stockSymbol].yes) {
          console.log(
            "stock balance of yes actual ",
            STOCK_BALANCES[userId][stockSymbol].yes.quantity
          );
        }
        console.log("user:", user, "userId:", userId);

        console.log(JSON.stringify(STOCK_BALANCES));
        console.log(STOCK_BALANCES[userId] == STOCK_BALANCES[user]);
      }

      if (ORDERBOOK[stockSymbol].no[price].orders[user].quantity === 0) {
        delete ORDERBOOK[stockSymbol].no[price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].no[price].total === 0) {
      delete ORDERBOOK[stockSymbol].no[price];
    }
  }

  if (availableYesQuantity > 0 && ORDERBOOK[stockSymbol].yes[10 - price]) {
    for (let user in ORDERBOOK[stockSymbol].yes[10 - price].orders) {
      if (!STOCK_BALANCES[userId]) {
        STOCK_BALANCES[userId] = {};
      }

      if (!STOCK_BALANCES[user]) {
        STOCK_BALANCES[user] = {};
      }

      if (!STOCK_BALANCES[userId][stockSymbol]) {
        STOCK_BALANCES[userId][stockSymbol] = {
          yes: { quantity: 0, locked: 0 },
          no: { quantity: 0, locked: 0 },
        };
      }

      if (!STOCK_BALANCES[user][stockSymbol]) {
        STOCK_BALANCES[user][stockSymbol] = {
          yes: { quantity: 0, locked: 0 },
          no: { quantity: 0, locked: 0 },
        };
      }
      if (tempQuantity <= 0) break;

      const available =
        ORDERBOOK[stockSymbol].yes[10 - price].orders[user].quantity;
      const toTake = Math.min(available, tempQuantity);

      ORDERBOOK[stockSymbol].yes[10 - price].orders[user].quantity -= toTake;
      ORDERBOOK[stockSymbol].yes[10 - price].total -= toTake;
      tempQuantity -= toTake;

      if (ORDERBOOK[stockSymbol].yes[10 - price].orders[user].type == "sell") {
        if (STOCK_BALANCES[user][stockSymbol].yes) {
          STOCK_BALANCES[user][stockSymbol].yes.locked -= toTake;
          INR_BALANCES[user].balance += toTake * 100 * (10 - price);
        }
      } else if (
        ORDERBOOK[stockSymbol].yes[10 - price].orders[user].type == "reverted"
      ) {
        if (STOCK_BALANCES[user][stockSymbol].no) {
          STOCK_BALANCES[user][stockSymbol].no.quantity += toTake;
          INR_BALANCES[user].locked -= toTake * 100 * (10 - price);
        }
      }

      if (ORDERBOOK[stockSymbol].yes[10 - price].orders[user].quantity === 0) {
        delete ORDERBOOK[stockSymbol].yes[10 - price].orders[user];
      }
    }

    if (ORDERBOOK[stockSymbol].yes[10 - price].total === 0) {
      delete ORDERBOOK[stockSymbol].yes[10 - price];
    }
  }

  if (tempQuantity > 0) {
    mintOppositeStock(stockSymbol, price, tempQuantity, userId, "no");
  }

  initializeStockBalance(userId, stockSymbol);

  if (STOCK_BALANCES[userId][stockSymbol]?.no) {
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity - tempQuantity;
  }

  console.log("the quantity is ",quantity, " the remaingin tempquant is ",tempQuantity)

  INR_BALANCES[userId].locked -= (quantity - tempQuantity) * price * 100;

  return {
    message: `Buy order for 'no' added for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  };
};
export const sellYesOption = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  if (!ORDERBOOK[stockSymbol]) {
    return { msg: "Invalid stock symbol" };
  }

  if (
    !STOCK_BALANCES[userId]?.[stockSymbol]?.yes ||
    STOCK_BALANCES[userId][stockSymbol].yes.quantity < quantity
  ) {
    return { error: 'Insufficient "yes" stocks to sell' };
  }

  STOCK_BALANCES[userId][stockSymbol].yes.quantity -= quantity;
  STOCK_BALANCES[userId][stockSymbol].yes.locked += quantity;

  let remainingQuantity = quantity;
  let opposingPrice = 10 - price;

  for (let p in ORDERBOOK[stockSymbol].no) {
    if (remainingQuantity <= 0) break;
    if (parseFloat(p) > opposingPrice) continue;

    for (let user in ORDERBOOK[stockSymbol].no[p].orders) {
      if (remainingQuantity <= 0) break;

      const availableQuantity =
        ORDERBOOK[stockSymbol].no[p].orders[user].quantity;
      const matchedQuantity = Math.min(availableQuantity, remainingQuantity);

      ORDERBOOK[stockSymbol].no[p].orders[user].quantity -= matchedQuantity;
      ORDERBOOK[stockSymbol].no[p].total -= matchedQuantity;
      remainingQuantity -= matchedQuantity;

      if (STOCK_BALANCES[user][stockSymbol].no) {
        STOCK_BALANCES[user][stockSymbol].no.locked -= matchedQuantity;
      }

      INR_BALANCES[user].balance += matchedQuantity * parseFloat(p) * 100;
    }

    if (ORDERBOOK[stockSymbol].no[p].total === 0) {
      delete ORDERBOOK[stockSymbol].no[p];
    }
  }

  INR_BALANCES[userId].balance += (quantity - remainingQuantity) * price * 100;
  STOCK_BALANCES[userId][stockSymbol].yes.locked -=
    quantity - remainingQuantity;

  if (remainingQuantity > 0) {
    if (!ORDERBOOK[stockSymbol].yes[price]) {
      ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
    }

    if (!ORDERBOOK[stockSymbol].yes[price].orders[userId]) {
      ORDERBOOK[stockSymbol].yes[price].orders[userId] = {
        quantity: 0,
        type: "sell",
      };
    }

    ORDERBOOK[stockSymbol].yes[price].total += remainingQuantity;
    ORDERBOOK[stockSymbol].yes[price].orders[userId].quantity +=
      remainingQuantity;
  }

  return {
    message: `Sell order for 'yes' stock placed for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  };
};

export const sellNoOption = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  if (!ORDERBOOK[stockSymbol]) {
    return { msg: "Invalid stock symbol" };
  }

  if (
    !STOCK_BALANCES[userId]?.[stockSymbol]?.no ||
    STOCK_BALANCES[userId][stockSymbol].no.quantity < quantity
  ) {
    return { error: 'Insufficient "no" stocks to sell' };
  }

  STOCK_BALANCES[userId][stockSymbol].no.quantity -= quantity;
  STOCK_BALANCES[userId][stockSymbol].no.locked += quantity;

  let remainingQuantity = quantity;
  let opposingPrice = 10 - price;

  for (let p in ORDERBOOK[stockSymbol].yes) {
    if (remainingQuantity <= 0) break;
    if (parseFloat(p) > opposingPrice) continue;

    for (let user in ORDERBOOK[stockSymbol].yes[p].orders) {
      if (remainingQuantity <= 0) break;

      const availableQuantity =
        ORDERBOOK[stockSymbol].yes[p].orders[user].quantity;
      const matchedQuantity = Math.min(availableQuantity, remainingQuantity);

      ORDERBOOK[stockSymbol].yes[p].orders[user].quantity -= matchedQuantity;
      ORDERBOOK[stockSymbol].yes[p].total -= matchedQuantity;
      remainingQuantity -= matchedQuantity;

      if (STOCK_BALANCES[user][stockSymbol].yes) {
        STOCK_BALANCES[user][stockSymbol].yes.locked -= matchedQuantity;
      }

      INR_BALANCES[user].balance += matchedQuantity * parseFloat(p) * 100;
    }

    if (ORDERBOOK[stockSymbol].yes[p].total === 0) {
      delete ORDERBOOK[stockSymbol].yes[p];
    }
  }

  INR_BALANCES[userId].balance += (quantity - remainingQuantity) * price * 100;
  STOCK_BALANCES[userId][stockSymbol].no.locked -= quantity - remainingQuantity;

  if (remainingQuantity > 0) {
    if (!ORDERBOOK[stockSymbol].no[price]) {
      ORDERBOOK[stockSymbol].no[price] = { total: 0, orders: {} };
    }

    if (!ORDERBOOK[stockSymbol].no[price].orders[userId]) {
      ORDERBOOK[stockSymbol].no[price].orders[userId] = {
        quantity: 0,
        type: "sell",
      };
    }

    ORDERBOOK[stockSymbol].no[price].total += remainingQuantity;
    ORDERBOOK[stockSymbol].no[price].orders[userId].quantity +=
      remainingQuantity;
  }

  return {
    message: `Sell order for 'no' stock placed for ${stockSymbol}`,
    orderbook: ORDERBOOK[stockSymbol],
  };
};
