import { ORDERBOOK } from "../models/orderbook";
import {
  buyNoOption,
  buyYesOption,
  sellNoOption,
  sellYesOption,
} from "../utils/helper";

export const buyOption = (userId:string, stockSymbol:string, quantity:number, originalPrice:number,stockType:string) => {

  const price = originalPrice / 100;
  let response;

  if (stockType == "yes") {
    response = buyYesOption(userId, stockSymbol, quantity, price);
  } else if (stockType == "no") {
    response = buyNoOption(userId, stockSymbol, quantity, price);
  }
  return {error:false, msg:response};
};

export const sellOption = (userId:string, stockSymbol:string, quantity:number, originalPrice:number,stockType:string) => {
  
  const price = originalPrice / 100;

  if (stockType == "yes") {
    const response = sellYesOption(userId, stockSymbol, quantity, price);
    return {error:false, msg: response};
  } else if (stockType == "no") {
    const response = sellNoOption(userId, stockSymbol, quantity, price)
    return {error:false, msg:response};
  }
};

export const viewOrderbook = () => {
  return ORDERBOOK;
};

export const viewIndividualOrderbook = (stockSymbol:string) => {
  const orderbook = ORDERBOOK[stockSymbol];

  if (!orderbook) {
    return { error:true, msg: "Orderbook with provided stock symbol not found" };
  }

  return {error:false, msg: orderbook};
};
