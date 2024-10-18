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

export const mintTrade = (userId: string, stockSymbol: string, quantity: number) => {
  if (!STOCK_BALANCES[userId]) {
    STOCK_BALANCES[userId] = {};
  }

  if (!STOCK_BALANCES[userId][stockSymbol]) {
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
  }

  if (!STOCK_BALANCES[userId][stockSymbol].yes || !STOCK_BALANCES[userId][stockSymbol].no) {
    STOCK_BALANCES[userId][stockSymbol].yes = { quantity: 0, locked: 0 };
    STOCK_BALANCES[userId][stockSymbol].no = { quantity: 0, locked: 0 };
  }

  STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
  STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;

  return { error: false, msg: STOCK_BALANCES[userId][stockSymbol] };
};
