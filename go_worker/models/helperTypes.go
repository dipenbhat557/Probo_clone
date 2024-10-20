package models

type Request struct {
	Method  string `json:"method"`
	Uid     string `json:"uid"`
	Payload string `json:"payload"`
}

type Response struct {
	Error   bool                      `json:"error"`
	Msg     string                    `json:"msg"`
	Balance map[string]UserINRBalance `json:"balance"`
}
