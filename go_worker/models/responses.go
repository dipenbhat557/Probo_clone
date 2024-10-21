package models

type ResponseMessage struct {
	Error bool   `json:"error"`
	Msg   string `json:"msg"`
}

type CreateUserResponse struct {
	Error   bool                      `json:"error"`
	Msg     string                    `json:"msg"`
	Balance map[string]UserINRBalance `json:"balance"`
}

type INRBalanceResponse struct {
	Error bool                      `json:"error"`
	Msg   map[string]UserINRBalance `json:"msg"`
}

type IndividualBalanceResponse struct {
	Error bool           `json:"error"`
	Msg   UserINRBalance `json:"msg"`
}

type OnrampINRResponse struct {
	Error   bool                      `json:"error"`
	Msg     string                    `json:"msg"`
	Balance map[string]UserINRBalance `json:"balance"`
}

type ResetResponse struct {
	Error bool   `json:"error"`
	Msg   string `json:"msg"`
}

type CreateSymbolResponse struct {
	Error bool   `json:"error"`
	Msg   string `json:"msg"`
}

type StockBalanceResponse struct {
	Error bool                            `json:"error"`
	Msg   map[string]map[string]UserStock `json:"msg"`
}

type IndividualStockBalanceResponse struct {
	Error bool                 `json:"error"`
	Msg   map[string]UserStock `json:"msg"`
}

type MintTradeResponse struct {
	Error bool `json:"error"`
	Msg   struct {
		Yes struct {
			Quantity int `json:"quantity,omitempty"`
			Locked   int `json:"locked,omitempty"`
		} `json:"yes"`
		No struct {
			Quantity int `json:"quantity,omitempty"`
			Locked   int `json:"locked,omitempty"`
		} `json:"no"`
	} `json:"msg"`
}
