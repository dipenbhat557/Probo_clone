package models

type UserINRBalance struct {
	Balance int `json:"balance"`
	Locked  int `json:"locked"`
}

var INR_BALANCES = map[string]UserINRBalance{}
