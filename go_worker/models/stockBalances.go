package models

type Stock struct {
	Quantity int `json:"quantity,omitempty"`
	Locked   int `json:"locked,omitempty"`
}

type UserStock struct {
	Yes Stock `json:"yes"`
	No  Stock `json:"no"`
}

var STOCK_BALANCES = map[string]map[string]UserStock{}
