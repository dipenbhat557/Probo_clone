package controllers

import (
	"fmt"

	"github.com/dipenbhat557/probo_clone/models"
)

func CreateUser(userId string) map[string]interface{} {
	if _, exists := models.INR_BALANCES[userId]; exists {
		return map[string]interface{}{
			"error": true,
			"msg":   "User already exists",
		}
	}

	models.INR_BALANCES[userId] = models.UserINRBalance{
		Balance: 0,
		Locked:  0,
	}
	models.STOCK_BALANCES[userId] = map[string]models.UserStock{}

	return map[string]interface{}{
		"error":   false,
		"msg":     fmt.Sprintf("User %s created successfully", userId),
		"balance": models.INR_BALANCES,
	}
}

func GetINRBalance() map[string]interface{} {
	return map[string]interface{}{
		"error": false,
		"msg":   models.INR_BALANCES,
	}
}

func GetIndividualBalance(userId string) map[string]interface{} {
	balance, exists := models.INR_BALANCES[userId]
	if !exists {
		return map[string]interface{}{
			"error": true,
			"msg":   fmt.Sprintf("User %s not found", userId),
		}
	}

	return map[string]interface{}{
		"error": false,
		"msg":   balance,
	}
}

func OnrampINR(userId string, amount int) map[string]interface{} {
	if _, exists := models.INR_BALANCES[userId]; !exists {
		return map[string]interface{}{
			"error": true,
			"msg":   fmt.Sprintf("User %s not found", userId),
		}
	}

	userBal := models.INR_BALANCES[userId]
	userBal.Balance += amount
	models.INR_BALANCES[userId] = userBal

	return map[string]interface{}{
		"error":   false,
		"msg":     fmt.Sprintf("INR %d added to user %s", amount/100, userId),
		"balance": models.INR_BALANCES[userId],
	}
}

func ResetAll() map[string]interface{} {
	resetOrderbook()
	resetInrBalance()
	resetStockBalance()

	return map[string]interface{}{
		"error": false,
		"msg":   "Orderbook, stock balances and INR balances reset successfully",
	}
}

func resetOrderbook() {
	models.ORDERBOOK = map[string]models.OrderBookSymbol{}
	fmt.Println("Orderbook reset")
}

func resetInrBalance() {
	models.INR_BALANCES = map[string]models.UserINRBalance{}
	fmt.Println("INR balances reset")
}

func resetStockBalance() {
	models.STOCK_BALANCES = map[string]map[string]models.UserStock{}
	fmt.Println("Stock balances reset")
}
