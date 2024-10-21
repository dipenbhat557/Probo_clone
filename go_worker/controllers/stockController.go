package controllers

import (
	"fmt"

	"github.com/dipenbhat557/probo_clone/models"
)

func CreateSymbol(stockSymbol string) map[string]interface{} {
	for userId := range models.STOCK_BALANCES {
		models.STOCK_BALANCES[userId][stockSymbol] = models.UserStock{
			Yes: models.Stock{
				Quantity: 0,
				Locked:   0,
			},
			No: models.Stock{
				Quantity: 0,
				Locked:   0,
			},
		}
	}

	models.ORDERBOOK[stockSymbol] = models.OrderBookSymbol{
		Yes: make(map[float64]models.PriceLevel),
		No:  make(map[float64]models.PriceLevel),
	}

	return map[string]interface{}{
		"error": false,
		"msg":   fmt.Sprintf("Symbol %s created successfully.", stockSymbol),
	}
}

func GetStockBalance() map[string]interface{} {
	return map[string]interface{}{"error": false, "msg": models.STOCK_BALANCES}
}

func GetIndividualStockBalance(userId string) map[string]interface{} {
	stock, exists := models.STOCK_BALANCES[userId]
	if !exists {
		return map[string]interface{}{
			"error": true,
			"msg":   "User not found or no stock balance available",
		}
	}
	return map[string]interface{}{
		"error": false,
		"msg":   stock,
	}
}

func MintTrade(userId string, stockSymbol string, quantity int) map[string]interface{} {

	if _, exists := models.STOCK_BALANCES[userId]; !exists {
		models.STOCK_BALANCES[userId] = make(map[string]models.UserStock)
	}

	if _, exists := models.STOCK_BALANCES[userId][stockSymbol]; !exists {
		models.STOCK_BALANCES[userId][stockSymbol] = models.UserStock{
			Yes: models.Stock{
				Quantity: 0,
				Locked:   0,
			},
			No: models.Stock{
				Quantity: 0,
				Locked:   0,
			},
		}
	}

	indStock := models.STOCK_BALANCES[userId][stockSymbol]
	indStock.Yes.Quantity += quantity
	indStock.No.Quantity += quantity
	models.STOCK_BALANCES[userId][stockSymbol] = indStock

	return map[string]interface{}{
		"error": false,
		"msg":   models.STOCK_BALANCES[userId][stockSymbol],
	}
}
