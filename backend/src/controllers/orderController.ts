import { Request, Response } from "express";
import { ORDERBOOK } from "../models/orderbook";
import {
  buyNoOption,
  buyYesOption,
  sellNoOption,
  sellYesOption,
} from "../utils/helper";

export const buyOption = (req: Request, res: Response) => {
  const {
    userId,
    stockSymbol,
    quantity,
    price: originalPrice,
    stockType,
  } = req.body;
  const price = originalPrice / 100;

  if (stockType == "yes") {
    return buyYesOption(userId, stockSymbol, quantity, price, res);
  } else if (stockType == "no") {
    return buyNoOption(userId, stockSymbol, quantity, price, res);
  }
};

export const sellOption = (req: Request, res: Response) => {
  const {
    userId,
    stockSymbol,
    quantity,
    price: originalPrice,
    stockType,
  } = req.body;
  const price = originalPrice / 100;

  if (stockType == "yes") {
    return sellYesOption(userId, stockSymbol, quantity, price, res);
  } else if (stockType == "no") {
    return sellNoOption(userId, stockSymbol, quantity, price, res);
  }
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
