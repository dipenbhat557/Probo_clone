package main

import "github.com/dipenbhat557/probo_clone/services"

func main() {
	redisClient := services.GetRedisClient()

	services.PollQueue(redisClient)
}
