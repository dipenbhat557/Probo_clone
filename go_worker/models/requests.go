package models

type CreateUserRequest struct {
	Method  string `json:"method"`
	Uid     string `json:"uid"`
	Payload string `json:"payload"`
}

type CreateSymbolRequest struct {
	Method  string `json:"method"`
	Uid     string `json:"uid"`
	Payload string `json:"payload"`
}

type ViewOrderbookRequest struct {
	Method string `json:"method"`
	Uid    string `json:"uid"`
}

type GetINRBalanceRequest struct {
	Method string `json:"method"`
	Uid    string `json:"uid"`
}

type GetStockBalanceRequest struct {
	Method string `json:"method"`
	Uid    string `json:"uid"`
}

type ResetAllRequest struct {
	Method string `json:"method"`
	Uid    string `json:"uid"`
}

type GetIndividualBalanceRequest struct {
	Method  string `json:"method"`
	Uid     string `json:"uid"`
	Payload string `json:"payload"`
}

type OnrampINRRequest struct {
	Method  string          `json:"method"`
	Uid     string          `json:"uid"`
	Payload OnrampINRParams `json:"payload"`
}

type OnrampINRParams struct {
	UserId string `json:"userId"`
	Amount int    `json:"amount"`
}

type GetIndividualStockBalanceRequest struct {
	Method  string `json:"method"`
	Uid     string `json:"uid"`
	Payload string `json:"payload"`
}

type BuyOptionRequest struct {
	Method  string              `json:"method"`
	Uid     string              `json:"uid"`
	Payload BuySellOptionParams `json:"payload"`
}

type SellOptionRequest struct {
	Method  string              `json:"method"`
	Uid     string              `json:"uid"`
	Payload BuySellOptionParams `json:"payload"`
}

type BuySellOptionParams struct {
	UserId      string `json:"userId"`
	StockSymbol string `json:"stockSymbol"`
	Quantity    int    `json:"quantity"`
	Price       int    `json:"price"`
	StockType   string `json:"stockType"`
}

type ViewIndividualOrderbookRequest struct {
	Method  string `json:"method"`
	Uid     string `json:"uid"`
	Payload string `json:"payload"`
}

type MintTradeRequest struct {
	Method  string          `json:"method"`
	Uid     string          `json:"uid"`
	Payload MintTradeParams `json:"payload"`
}

type MintTradeParams struct {
	UserId      string `json:"userId"`
	StockSymbol string `json:"stockSymbol"`
	Quantity    int    `json:"quantity"`
}
