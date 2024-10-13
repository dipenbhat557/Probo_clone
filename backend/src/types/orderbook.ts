export interface Order {
  quantity: number;
  orderType: "buy" | "sell";
}

export interface OrderEntry {
  total: number;
  orders: Record<string, Order>;
}

export interface Orderbook {
  yes: Record<number, OrderEntry>;
  no: Record<number, OrderEntry>;
}
