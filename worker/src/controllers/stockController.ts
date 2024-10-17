import { Request, Response } from "express";
import { STOCK_BALANCES } from "../models/balances";
import { ORDERBOOK } from "../models/orderbook";

export const createSymbol = (stockSymbol: string) => {
  // const defaultStockBalance: StockBalance = {
  //     yes: {
  //         quantity: 0,
  //         locked: 0
  //     },
  //     no: {
  //         quantity: 0,
  //         locked: 0
  //     }
  // };

  // Object.keys(STOCK_BALANCES).forEach(userId => {
  //     STOCK_BALANCES[userId][stockSymbol] = {
  //         ...defaultStockBalance,
  //         yes: {
  //             ...defaultStockBalance.yes,
  //             ...{ quantity: defaultStockBalance.yes!.quantity, locked: defaultStockBalance.yes!.locked }
  //         },
  //         no: {
  //             ...defaultStockBalance.no,
  //             ...{ quantity: defaultStockBalance.no!.quantity, locked: defaultStockBalance.no!.locked }
  //         }
  //     };
  // });

  Object.keys(STOCK_BALANCES).forEach((userId) => {
    STOCK_BALANCES[userId][stockSymbol] = {
      yes: {
        quantity: 0,
        locked: 0,
      },
      no: {
        quantity: 0,
        locked: 0,
      },
    };
  });

  ORDERBOOK[stockSymbol] = { yes: {}, no: {} };

  return { error: false, msg: `Symbol ${stockSymbol} created successfully.` };
};

export const getStockBalance = () => {
  return STOCK_BALANCES;
};

export const getIndividualStockBalance = (userId: string) => {
  const stock = STOCK_BALANCES[userId];
  if (!stock) {
    return { error:true, msg: "User not found or no stock balance available" };
  }
  return {error:false, msg: stock};
};

export const mintTrade = (
  userId: string,
  stockSymbol: string,
  quantity: number
) => {
  ORDERBOOK[stockSymbol].yes[5].total += quantity;
  ORDERBOOK[stockSymbol].yes[5].orders[userId].quantity =
    (ORDERBOOK?.[stockSymbol]?.yes[5]?.orders[userId].quantity || 0) + quantity;
  ORDERBOOK[stockSymbol].yes[5].orders[userId].type = "sell";

  ORDERBOOK[stockSymbol].no[5].total += quantity;
  ORDERBOOK[stockSymbol].no[5].orders[userId].quantity =
    (ORDERBOOK?.[stockSymbol]?.no[5]?.orders[userId].quantity || 0) + quantity;
  ORDERBOOK[stockSymbol].no[5].orders[userId].type = "sell";

  return {error:false, msg: ORDERBOOK?.[stockSymbol]};
};
