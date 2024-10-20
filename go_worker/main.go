package main

import "github.com/dipenbhat557/probo_clone/services"

func main() {
	redisClient := services.GetRedisClient()
	// publisherClient := services.GetPublisherClient()

	services.PollQueue(redisClient)
}
