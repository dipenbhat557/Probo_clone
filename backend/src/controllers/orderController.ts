import { Request, Response } from "express";
import { INR_BALANCES, STOCK_BALANCES } from "../models/balances";
import { ORDERBOOK } from "../models/orderbook";
import { initializeStockBalance, validateOrder } from "../utils/validation";





const mintOppositeStock = (stockSymbol: string, price: number, quantity: number,userId:number, orderType: 'yes' | 'no') => {
    const oppositePrice = 10 - price;
  
    if (orderType === 'yes') {
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
      (ORDERBOOK[stockSymbol].yes[oppositePrice].orders[userId] || 0) + quantity;
    }
  };
  
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
  
  //   if (ORDERBOOK[stockSymbol].no[10 - price]) {
  //     mintOppositeStock(stockSymbol, price, quantity, 'yes');
  //   }
  
    if (!ORDERBOOK[stockSymbol].yes[price]) {
      // ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
      mintOppositeStock(stockSymbol, price, quantity, userId, 'yes');
    }else{
      ORDERBOOK[stockSymbol].yes[price].total += quantity;
      ORDERBOOK[stockSymbol].yes[price].orders[userId] =
      (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;
    }
  
  
  //   initializeStockBalance(userId, stockSymbol);
  
  //   if (STOCK_BALANCES[userId][stockSymbol]?.yes) {
  //     STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
  //   }
  
    return res.json({
      message: `Buy order for 'yes' added for ${stockSymbol}`,
      orderbook: ORDERBOOK[stockSymbol],
    });
  };
  
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
  
  //   if (ORDERBOOK[stockSymbol].yes[10 - price]) {
  //     mintOppositeStock(stockSymbol, price, quantity, 'no');
  //   }
  
    if (!ORDERBOOK[stockSymbol].no[price]) {
          mintOppositeStock(stockSymbol, price, quantity,userId, 'no');
    }else{
  
    ORDERBOOK[stockSymbol].no[price].total += quantity;
    ORDERBOOK[stockSymbol].no[price].orders[userId] =
      (ORDERBOOK[stockSymbol].no[price].orders[userId] || 0) + quantity;
    }
  
  //   initializeStockBalance(userId, stockSymbol);
  
  //   if (STOCK_BALANCES[userId][stockSymbol]?.no) {
  //     STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
  //   }
  
    return res.json({
      message: `Buy order for 'no' added for ${stockSymbol}`,
      orderbook: ORDERBOOK[stockSymbol],
    });
  };
  
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
    ORDERBOOK[stockSymbol].yes[price].orders[userId] =
      (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;
    return res.json({
      message: `Sell order for 'yes' added for ${stockSymbol}`,
      orderbook: ORDERBOOK[stockSymbol],
    });
  };
  
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
  
  export const viewIndividualOrderbook = (req: Request, res: Response): Response => {
    const { stockSymbol } = req.params;
    const orderbook = ORDERBOOK[stockSymbol];
  
    if (!orderbook) {
      return res.status(404).json({ error: 'Orderbook with provided stock symbol not found' });
    }
  
    return res.json(orderbook);
  };
  









// export const buyYesOption = (req: Request, res: Response): Response => {
//   const { userId, stockSymbol, quantity, price } = req.body;

//   if (!validateOrder(userId, stockSymbol, quantity, price, INR_BALANCES)) {
//     return res.status(400).json({ error: "Invalid order" });
//   }

//   INR_BALANCES[userId].balance -= quantity * price;
//   INR_BALANCES[userId].locked += quantity * price;

//   if (!ORDERBOOK[stockSymbol]) {
//     ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
//   }
//   if (!ORDERBOOK[stockSymbol].yes[price]) {
//     ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
//   }
//   ORDERBOOK[stockSymbol].yes[price].total += quantity;
//   ORDERBOOK[stockSymbol].yes[price].orders[userId] = 
//     (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;

//   initializeStockBalance(userId, stockSymbol);

//   if (STOCK_BALANCES[userId][stockSymbol]?.yes) {
//     STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
//   }

//   return res.json({
//     message: `Buy order for 'yes' added for ${stockSymbol}`,
//     orderbook: ORDERBOOK[stockSymbol],
//   });
// };

// export const buyNoOption = (req: Request, res: Response): Response => {
//   const { userId, stockSymbol, quantity, price } = req.body;

//   if (!validateOrder(userId, stockSymbol, quantity, price, INR_BALANCES)) {
//     return res.status(400).json({ error: "Invalid order" });
//   }

//   INR_BALANCES[userId].balance -= quantity * price;
//   INR_BALANCES[userId].locked += quantity * price;

//   if (!ORDERBOOK[stockSymbol]) {
//     ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
//   }
//   if (!ORDERBOOK[stockSymbol].no[price]) {
//     ORDERBOOK[stockSymbol].no[price] = { total: 0, orders: {} };
//   }
//   ORDERBOOK[stockSymbol].no[price].total += quantity;
//   ORDERBOOK[stockSymbol].no[price].orders[userId] = 
//     (ORDERBOOK[stockSymbol].no[price].orders[userId] || 0) + quantity;

//   initializeStockBalance(userId, stockSymbol);

//   if (STOCK_BALANCES[userId][stockSymbol]?.no) {
//     STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
//   }

//   return res.json({
//     message: `Buy order for 'no' added for ${stockSymbol}`,
//     orderbook: ORDERBOOK[stockSymbol],
//   });
// };

// export const sellYesOption = (req: Request, res: Response): Response => {
//   const { userId, stockSymbol, quantity, price } = req.body;

//   if (STOCK_BALANCES[userId][stockSymbol]?.yes) {
//     if (STOCK_BALANCES[userId]?.[stockSymbol]?.yes.quantity < quantity) {
//       return res
//         .status(400)
//         .json({ error: 'Insufficient "yes" stocks to sell' });
//     }

//     STOCK_BALANCES[userId][stockSymbol].yes.quantity -= quantity;
//     STOCK_BALANCES[userId][stockSymbol].yes.locked += quantity;
//   }
//   if (!ORDERBOOK[stockSymbol].yes[price]) {
//     ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
//   }
//   ORDERBOOK[stockSymbol].yes[price].total += quantity;
//   ORDERBOOK[stockSymbol].yes[price].orders[userId] = 
//     (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;
//   return res.json({
//     message: `Sell order for 'yes' added for ${stockSymbol}`,
//     orderbook: ORDERBOOK[stockSymbol],
//   });
// };

// export const sellNoOption = (req: Request, res: Response): Response => {
//   const { userId, stockSymbol, quantity, price } = req.body;

//   if (STOCK_BALANCES[userId]?.[stockSymbol]?.no) {
//     if (STOCK_BALANCES[userId]?.[stockSymbol]?.no.quantity < quantity) {
//       return res
//         .status(400)
//         .json({ error: 'Insufficient "no" stocks to sell' });
//     }

//     STOCK_BALANCES[userId][stockSymbol].no.quantity -= quantity;
//     STOCK_BALANCES[userId][stockSymbol].no.locked += quantity;
//   }

//   if (!ORDERBOOK[stockSymbol].no[price]) {
//     ORDERBOOK[stockSymbol].no[price] = { total: 0, orders: {} };
//   }
//   ORDERBOOK[stockSymbol].no[price].total += quantity;
//   ORDERBOOK[stockSymbol].yes[price].orders[userId] = 
//     (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;
//   return res.json({
//     message: `Sell order for 'no' added for ${stockSymbol}`,
//     orderbook: ORDERBOOK[stockSymbol],
//   });
// };

// export const viewOrderbook = (req: Request, res: Response): Response => {
//   return res.json(ORDERBOOK);
// };

// export const viewIndividualOrderbook = (req:Request, res: Response): Response => {

//     const {stockSymbol} = req.params;
//     const orderbook = ORDERBOOK[stockSymbol];

//     if(!orderbook){
//         return res.status(404).json({ error: 'Orderbook with provided stock symbol not found' });
//     }

//     return res.json(orderbook);
// }
