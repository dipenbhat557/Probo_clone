package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dipenbhat557/probo_clone/controllers"
	"github.com/dipenbhat557/probo_clone/models"
	"github.com/dipenbhat557/probo_clone/utils"
	"github.com/redis/go-redis/v9"
)

var redisClient = redis.NewClient(&redis.Options{
	Addr: "localhost:6379",
})

func ProcessOrder(data []byte) {
	var baseRequest struct {
		Method string `json:"method"`
		Uid    string `json:"uid"`
	}

	err := json.Unmarshal(data, &baseRequest)
	if err != nil {
		fmt.Println("Error unmarshalling base request:", err)
		return
	}
	fmt.Println("request is ", baseRequest.Method)

	var response interface{}

	switch baseRequest.Method {
	case "createUser":
		var req models.CreateUserRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.CreateUser(req.Payload)

	case "createSymbol":
		var req models.CreateSymbolRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.CreateSymbol(req.Payload)

	case "viewOrderbook":
		response = controllers.ViewOrderbook()

	case "getINRBalance":
		response = controllers.GetINRBalance()

	case "getStockBalance":
		response = controllers.GetStockBalance()

	case "resetAll":
		response = controllers.ResetAll()

	case "getIndividualBalance":
		var req models.GetIndividualBalanceRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.GetIndividualBalance(req.Payload)

	case "onrampINR":
		var req models.OnrampINRRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.OnrampINR(req.Payload.UserId, req.Payload.Amount)

	case "getIndividualStockBalance":
		var req models.GetIndividualStockBalanceRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.GetIndividualStockBalance(req.Payload)

	case "buyOption":
		var req models.BuyOptionRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.BuyOption(req.Payload.UserId, req.Payload.StockSymbol, req.Payload.Quantity, req.Payload.Price, req.Payload.StockType)

	case "sellOption":
		var req models.SellOptionRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.SellOption(req.Payload.UserId, req.Payload.StockSymbol, req.Payload.Quantity, req.Payload.Price, req.Payload.StockType)

	case "viewIndividualOrderbook":
		var req models.ViewIndividualOrderbookRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		fmt.Println("individual orderbook is ", req.Payload)
		response = controllers.ViewIndividualOrderbook(req.Payload)

	case "mintTrade":
		var req models.MintTradeRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)
		response = controllers.MintTrade(req.Payload.UserId, req.Payload.StockSymbol, req.Payload.Quantity)

	default:
		response = map[string]interface{}{"error": true, "msg": "Method not available"}
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Printf("failed to marshal response: %v", err)
	}

	channel := fmt.Sprintf("response.%s", baseRequest.Uid)
	if err := redisClient.Publish(context.Background(), channel, string(responseJSON)).Err(); err != nil {
		fmt.Printf("failed to publish to Redis: %v", err)
	}

	fmt.Println("Response published to channel:", channel)

	if baseRequest.Method == "buyOption" || baseRequest.Method == "sellOption" {

		var req models.BuyOptionRequest
		err = json.Unmarshal(data, &req)
		utils.HandleNilError(err)

		res, err := utils.ConvertIndividualOrderBookToJSON(req.Payload.StockSymbol)

		if err != nil {
			utils.HandleNilError(err)
		}

		responseJSON, err := json.Marshal(res)
		if err != nil {
			fmt.Printf("failed to marshal response: %v", err)
		}

		channel := fmt.Sprintf("orderbook.%s", req.Payload.StockSymbol)
		if err := redisClient.Publish(context.Background(), channel, string(responseJSON)).Err(); err != nil {
			fmt.Printf("failed to publish to Pub/Sub: %v", err)
		}

		fmt.Println("Successfully published to Pub/Sub")
	}
}
