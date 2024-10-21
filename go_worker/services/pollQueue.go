package services

import (
	"fmt"
	"log"

	"github.com/dipenbhat557/probo_clone/models"
	"github.com/redis/go-redis/v9"
)

func PollQueue(rdb *redis.Client) {
	for {
		data, err := rdb.BRPop(ctx, 0, "requestQueue").Result()
		if err != nil {
			log.Fatalf("Failed to pop from queue: %v", err)
		}

		fmt.Println("the data got is ", data)

		// var request models.Request
		// json.Unmarshal(, &request)

		req := []byte(data[1])

		ProcessOrder(req)

	}
}

func PublishOrderbook(stockSymbol string, publisher *redis.Client) {
	channel := "orderbook." + stockSymbol
	publisher.Publish(ctx, channel, models.ORDERBOOK[stockSymbol])
	fmt.Printf("successfully published to %v and the data is %v", channel, models.ORDERBOOK[stockSymbol])
}
