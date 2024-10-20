package services

import (
	"context"
	"log"
	"sync"

	"github.com/redis/go-redis/v9"
)

var redisInstance *redis.Client
var redisOnce sync.Once

var ctx = context.Background()

func GetRedisClient() *redis.Client {
	redisOnce.Do(func() {
		redisInstance = redis.NewClient(&redis.Options{
			Addr: "localhost:6379",
		})

		if _, err := redisInstance.Ping(ctx).Result(); err != nil {
			log.Fatalf("Failed to connect to Redis: %v", err)
		}

		log.Println("Redis client successfully initialized.")
	})

	return redisInstance
}
