package models

type Stock struct {
	Quantity float64 `json:"quantity"`
	Locked   float64 `json:"locked"`
}

type UserStock struct {
	Yes Stock `json:"yes"`
	No  Stock `json:"no"`
}

var STOCK_BALANCES = map[string]map[string]UserStock{}
