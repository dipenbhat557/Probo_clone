export interface OrderEntry {
  total: number;
  orders: Record<string, number>;
}

export interface Orderbook {
  yes: Record<number, OrderEntry>;
  no: Record<number, OrderEntry>;
}
