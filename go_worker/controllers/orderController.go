package controllers

import (
	"github.com/dipenbhat557/probo_clone/models"
	"github.com/dipenbhat557/probo_clone/utils"
)

func BuyOption(userId string, stockSymbol string, quantity int, originalPrice int, stockType string) map[string]interface{} {
	price := float64(originalPrice) / 100
	var response map[string]interface{}

	if stockType == "yes" {
		response = utils.BuyYesOption(userId, stockSymbol, quantity, price)
	} else if stockType == "no" {
		response = utils.BuyNoOption(userId, stockSymbol, quantity, price)
	}

	return map[string]interface{}{"error": false, "msg": response}
}

func SellOption(userId string, stockSymbol string, quantity int, originalPrice int, stockType string) map[string]interface{} {
	price := float64(originalPrice) / 100

	if stockType == "yes" {
		response := utils.SellYesOption(userId, stockSymbol, quantity, price)
		return map[string]interface{}{"error": false, "msg": response}
	} else if stockType == "no" {
		response := utils.SellNoOption(userId, stockSymbol, quantity, price)
		return map[string]interface{}{"error": false, "msg": response}
	}

	return map[string]interface{}{"error": true, "msg": "Invalid stock type"}
}

func ViewOrderbook() map[string]interface{} {
	res, err := utils.ConvertFullOrderBookToJSON()

	if err != nil {
		utils.HandleNilError(err)
	}

	return map[string]interface{}{"error": false, "msg": res}
}

func ViewIndividualOrderbook(stockSymbol string) map[string]interface{} {
	_, exists := models.ORDERBOOK[stockSymbol]

	if !exists {
		return map[string]interface{}{"error": true, "msg": "Orderbook with provided stock symbol not found"}
	}

	res, err := utils.ConvertIndividualOrderBookToJSON(stockSymbol)

	if err != nil {
		utils.HandleNilError(err)
	}

	return map[string]interface{}{"error": false, "msg": res}
}
