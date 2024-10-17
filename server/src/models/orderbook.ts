import { Orderbook } from '../types/orderbook';

export let ORDERBOOK: Record<string, Orderbook> = {};

export const resetOrderbook = () => {
    ORDERBOOK = {}
}