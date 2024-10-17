import { StockBalance } from "../types/balances";
import { INRBalance } from "../types/balances";

export let INR_BALANCES: Record<string, INRBalance> = {};

export let STOCK_BALANCES: Record<string, Record<string, StockBalance>> = {};


export const resetInrbalance = () => {
    INR_BALANCES = {}
}

export const resetStockbalance = () => {
    STOCK_BALANCES = {}
}

// export const STOCK_BALANCES: Record<string, Record<string, StockBalance>> = {
//     user1: {
//         "BTC_USDT_10_Oct_2024_9_30": {
//             yes: {
//                 quantity: 1,
//                 locked: 0
//             }
//         }
//     },
//     user2: {
//         "BTC_USDT_10_Oct_2024_9_30": {
//             no: {
//                 quantity: 3,
//                 locked: 4
//             }
//         }
//     }
// };
