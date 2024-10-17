export interface IndividualEntry{
  type: 'sell' | 'reverted',
  quantity: number
}

export interface OrderEntry {
  total: number;
  orders: Record<string, IndividualEntry>;
}

export interface Orderbook {
  yes: Record<number, OrderEntry>;
  no: Record<number, OrderEntry>;
}
