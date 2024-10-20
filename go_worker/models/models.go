package models

type Order struct {
	Type     string `json:"type"`
	Quantity int    `json:"quantity"`
}

type PriceLevel struct {
	Total  int              `json:"total"`
	Orders map[string]Order `json:"orders"`
}

type OrderBookSymbol struct {
	Yes map[string]PriceLevel `json:"yes"`
	No  map[string]PriceLevel `json:"no"`
}

var ORDERBOOK = map[string]OrderBookSymbol{}
