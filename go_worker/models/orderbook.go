package models

type Order struct {
	Type     string `json:"type,omitempty"`
	Quantity int    `json:"quantity,omitempty"`
}

type PriceLevel struct {
	Total  int              `json:"total"`
	Orders map[string]Order `json:"orders"`
}

type OrderBookSymbol struct {
	Yes map[float64]PriceLevel `json:"yes"`
	No  map[float64]PriceLevel `json:"no"`
}

var ORDERBOOK = map[string]OrderBookSymbol{}
