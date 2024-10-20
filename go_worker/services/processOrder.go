package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dipenbhat557/probo_clone/models"
	"github.com/redis/go-redis/v9"
)

var redisClient = redis.NewClient(&redis.Options{
	Addr: "localhost:6379",
})

func ProcessOrder(request models.Request) {
	fmt.Println("Processing request is :", request)

	userId := request.Payload
	fmt.Println("the userid is ", userId)
	uid := request.Uid
	fmt.Println("the uid is ", uid)

	if _, exists := models.INR_BALANCES[userId]; !exists {
		models.INR_BALANCES[userId] = models.UserINRBalance{
			Balance: 0,
			Locked:  0,
		}
	}

	if _, exists := models.STOCK_BALANCES[userId]; !exists {
		models.STOCK_BALANCES[userId] = make(map[string]models.UserStock)
	}

	response := models.Response{
		Error:   false,
		Msg:     fmt.Sprintf("User %s created successfully", userId),
		Balance: models.INR_BALANCES,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Printf("failed to marshal response: %v", err)
	}

	channel := fmt.Sprintf("response.%s", uid)

	if err := redisClient.Publish(context.Background(), channel, string(responseJSON)).Err(); err != nil {
		fmt.Printf("failed to publish to Redis: %v", err)
	}

	fmt.Println("Response published to channel:", channel)
}
