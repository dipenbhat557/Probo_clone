package utils

import (
	"fmt"
	"math"

	"github.com/dipenbhat557/probo_clone/models"
)

func HandleNilError(err error) {
	if err != nil {
		fmt.Println("Error unmarshalling data:", err)
	}
}

func validateOrder(userId string, quantity int, price float64) bool {
	if _, ok := models.INR_BALANCES[userId]; !ok {
		return false
	}
	if float64(models.INR_BALANCES[userId].Balance) < float64(quantity)*price || price <= 0 {
		return false
	}
	return true
}

func initializeStockBalance(userId string, stockSymbol string) {
	if _, ok := models.STOCK_BALANCES[userId]; !ok {
		models.STOCK_BALANCES[userId] = make(map[string]models.UserStock)
	}
	if _, ok := models.STOCK_BALANCES[userId][stockSymbol]; !ok {
		models.STOCK_BALANCES[userId][stockSymbol] = models.UserStock{
			Yes: models.Stock{Quantity: 0, Locked: 0},
			No:  models.Stock{Quantity: 0, Locked: 0},
		}
	}
}

func mintOppositeStock(stockSymbol string, price float64, quantity int, userId string, orderType string) {
	oppositePrice := 10 - price

	if orderType == "yes" {
		if _, ok := models.ORDERBOOK[stockSymbol]; !ok {
			models.ORDERBOOK[stockSymbol] = models.OrderBookSymbol{
				No:  make(map[float64]models.PriceLevel),
				Yes: make(map[float64]models.PriceLevel),
			}
		}
		if _, ok := models.ORDERBOOK[stockSymbol].No[oppositePrice]; !ok {
			models.ORDERBOOK[stockSymbol].No[oppositePrice] = models.PriceLevel{
				Total:  0,
				Orders: make(map[string]models.Order),
			}
		}
		priceLevel, exists := models.ORDERBOOK[stockSymbol].No[oppositePrice]
		if !exists {
			priceLevel = models.PriceLevel{
				Total:  0,
				Orders: make(map[string]models.Order),
			}
		}

		priceLevel.Total += quantity
		order := priceLevel.Orders[userId]
		order.Type = "reverted"
		order.Quantity += quantity
		priceLevel.Orders[userId] = order

		models.ORDERBOOK[stockSymbol].No[oppositePrice] = priceLevel
	} else {
		if _, ok := models.ORDERBOOK[stockSymbol]; !ok {
			models.ORDERBOOK[stockSymbol] = models.OrderBookSymbol{
				No:  make(map[float64]models.PriceLevel),
				Yes: make(map[float64]models.PriceLevel),
			}
		}
		if _, ok := models.ORDERBOOK[stockSymbol].Yes[oppositePrice]; !ok {
			models.ORDERBOOK[stockSymbol].Yes[oppositePrice] = models.PriceLevel{
				Total:  0,
				Orders: make(map[string]models.Order),
			}
		}
		priceLevel, exists := models.ORDERBOOK[stockSymbol].Yes[oppositePrice]
		if !exists {
			priceLevel = models.PriceLevel{
				Total:  0,
				Orders: make(map[string]models.Order),
			}
		}

		priceLevel.Total += quantity
		order := priceLevel.Orders[userId]
		order.Type = "reverted"
		order.Quantity += quantity
		priceLevel.Orders[userId] = order

		models.ORDERBOOK[stockSymbol].Yes[oppositePrice] = priceLevel
	}
}

func BuyYesOption(userId string, stockSymbol string, quantity int, price float64) map[string]interface{} {
	if !validateOrder(userId, quantity, price) {
		return map[string]interface{}{"error": true, "msg": "Invalid order"}
	}

	models.INR_BALANCES[userId] = models.UserINRBalance{
		Balance: models.INR_BALANCES[userId].Balance - int(float64(quantity)*price*100),
		Locked:  models.INR_BALANCES[userId].Locked + int(float64(quantity)*price*100),
	}

	if _, ok := models.ORDERBOOK[stockSymbol]; !ok {
		models.ORDERBOOK[stockSymbol] = models.OrderBookSymbol{
			No:  make(map[float64]models.PriceLevel),
			Yes: make(map[float64]models.PriceLevel),
		}
	}

	var availableQuantity, availableNoQuantity int
	if yesBook, ok := models.ORDERBOOK[stockSymbol]; ok {
		if priceLevel, ok := yesBook.Yes[price]; ok {
			availableQuantity = priceLevel.Total
		}
	}

	if noBook, ok := models.ORDERBOOK[stockSymbol]; ok {
		if priceLevel, ok := noBook.No[10-price]; ok {
			availableNoQuantity = priceLevel.Total
		}
	}

	tempQuantity := quantity

	if availableQuantity > 0 {
		for user, order := range models.ORDERBOOK[stockSymbol].Yes[price].Orders {
			if tempQuantity <= 0 {
				break
			}

			toTake := int(math.Min(float64(order.Quantity), float64(tempQuantity)))

			models.ORDERBOOK[stockSymbol].Yes[price].Orders[user] = models.Order{
				Type:     order.Type,
				Quantity: order.Quantity - toTake,
			}
			priceVal := models.ORDERBOOK[stockSymbol].Yes[price]
			priceVal.Total -= toTake
			models.ORDERBOOK[stockSymbol].Yes[price] = priceVal
			tempQuantity -= toTake

			if order.Type == "sell" {
				yesVal := models.STOCK_BALANCES[user][stockSymbol]
				yesVal.Yes.Locked -= toTake
				models.STOCK_BALANCES[user][stockSymbol] = yesVal

				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance + int(float64(toTake)*price*100),
					Locked:  models.INR_BALANCES[user].Locked,
				}
			} else if order.Type == "reverted" {
				noVal := models.STOCK_BALANCES[user][stockSymbol]
				noVal.No.Quantity += toTake
				models.STOCK_BALANCES[user][stockSymbol] = noVal

				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance,
					Locked:  models.INR_BALANCES[user].Locked - int(float64(toTake)*price*100),
				}
			}

			if models.ORDERBOOK[stockSymbol].Yes[price].Orders[user].Quantity == 0 {
				delete(models.ORDERBOOK[stockSymbol].Yes[price].Orders, user)
			}
		}

		if models.ORDERBOOK[stockSymbol].Yes[price].Total == 0 {
			delete(models.ORDERBOOK[stockSymbol].Yes, price)
		}
	}

	if availableNoQuantity > 0 {
		for user, order := range models.ORDERBOOK[stockSymbol].No[10-price].Orders {
			if tempQuantity <= 0 {
				break
			}

			toTake := int(math.Min(float64(order.Quantity), float64(tempQuantity)))

			models.ORDERBOOK[stockSymbol].No[10-price].Orders[user] = models.Order{
				Type:     order.Type,
				Quantity: order.Quantity - toTake,
			}
			noVal := models.ORDERBOOK[stockSymbol].No[10-price]
			noVal.Total -= toTake
			models.ORDERBOOK[stockSymbol].No[10-price] = noVal
			tempQuantity -= toTake

			if order.Type == "sell" {
				noVal := models.STOCK_BALANCES[user][stockSymbol]
				noVal.No.Locked -= toTake
				models.STOCK_BALANCES[user][stockSymbol] = noVal
				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance + int(float64(toTake)*(10-price)*100),
					Locked:  models.INR_BALANCES[user].Locked,
				}
			} else if order.Type == "reverted" {
				yesVal := models.STOCK_BALANCES[user][stockSymbol]
				yesVal.Yes.Quantity += toTake
				models.STOCK_BALANCES[user][stockSymbol] = yesVal
				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance,
					Locked:  models.INR_BALANCES[user].Locked - int(float64(toTake)*(10-price)*100),
				}
			}

			if models.ORDERBOOK[stockSymbol].No[10-price].Orders[user].Quantity == 0 {
				delete(models.ORDERBOOK[stockSymbol].No[10-price].Orders, user)
			}
		}

		if models.ORDERBOOK[stockSymbol].No[10-price].Total == 0 {
			delete(models.ORDERBOOK[stockSymbol].No, 10-price)
		}
	}

	if tempQuantity > 0 {
		mintOppositeStock(stockSymbol, price, tempQuantity, userId, "yes")
	}

	initializeStockBalance(userId, stockSymbol)

	stockVal := models.STOCK_BALANCES[userId][stockSymbol]
	stockVal.Yes.Quantity += quantity - tempQuantity
	models.STOCK_BALANCES[userId][stockSymbol] = stockVal

	models.INR_BALANCES[userId] = models.UserINRBalance{
		Balance: models.INR_BALANCES[userId].Balance,
		Locked:  models.INR_BALANCES[userId].Locked - int(float64(quantity-tempQuantity)*price*100),
	}

	res, err := ConvertIndividualOrderBookToJSON(stockSymbol)

	if err != nil {
		HandleNilError(err)
	}

	return map[string]interface{}{
		"message":   fmt.Sprintf("Buy order for 'yes' added for %s", stockSymbol),
		"orderbook": res,
	}
}

func BuyNoOption(userId string, stockSymbol string, quantity int, price float64) map[string]interface{} {
	if !validateOrder(userId, quantity, price) {
		return map[string]interface{}{"error": "Invalid order"}
	}

	models.INR_BALANCES[userId] = models.UserINRBalance{
		Balance: models.INR_BALANCES[userId].Balance - int(float64(quantity)*price*100),
		Locked:  models.INR_BALANCES[userId].Locked + int(float64(quantity)*price*100),
	}

	if _, ok := models.ORDERBOOK[stockSymbol]; !ok {
		models.ORDERBOOK[stockSymbol] = models.OrderBookSymbol{
			No:  make(map[float64]models.PriceLevel),
			Yes: make(map[float64]models.PriceLevel),
		}
	}

	var availableQuantity, availableYesQuantity int
	if noBook, ok := models.ORDERBOOK[stockSymbol]; ok {
		if priceLevel, ok := noBook.No[price]; ok {
			availableQuantity = priceLevel.Total
		}
	}
	if yesBook, ok := models.ORDERBOOK[stockSymbol]; ok {
		if priceLevel, ok := yesBook.Yes[10-price]; ok {
			availableYesQuantity = priceLevel.Total
		}
	}

	tempQuantity := quantity

	if availableQuantity > 0 {
		for user, order := range models.ORDERBOOK[stockSymbol].No[price].Orders {
			if tempQuantity <= 0 {
				break
			}

			toTake := int(math.Min(float64(order.Quantity), float64(tempQuantity)))

			models.ORDERBOOK[stockSymbol].No[price].Orders[user] = models.Order{
				Type:     order.Type,
				Quantity: order.Quantity - toTake,
			}
			noPriceVal := models.ORDERBOOK[stockSymbol].No[price]
			noPriceVal.Total -= toTake
			models.ORDERBOOK[stockSymbol].No[price] = noPriceVal
			tempQuantity -= toTake

			if order.Type == "sell" {
				noVal := models.STOCK_BALANCES[user][stockSymbol]
				noVal.No.Locked -= toTake
				models.STOCK_BALANCES[user][stockSymbol] = noVal

				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance + int(float64(toTake)*price*100),
					Locked:  models.INR_BALANCES[user].Locked,
				}
			} else if order.Type == "reverted" {
				yesVal := models.STOCK_BALANCES[user][stockSymbol]
				yesVal.Yes.Quantity += toTake
				models.STOCK_BALANCES[user][stockSymbol] = yesVal

				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance,
					Locked:  models.INR_BALANCES[user].Locked - int(float64(toTake)*price*100),
				}
			}

			if models.ORDERBOOK[stockSymbol].No[price].Orders[user].Quantity == 0 {
				delete(models.ORDERBOOK[stockSymbol].No[price].Orders, user)
			}
		}

		if models.ORDERBOOK[stockSymbol].No[price].Total == 0 {
			delete(models.ORDERBOOK[stockSymbol].No, price)
		}
	}

	if availableYesQuantity > 0 {
		for user, order := range models.ORDERBOOK[stockSymbol].Yes[10-price].Orders {
			if tempQuantity <= 0 {
				break
			}

			toTake := int(math.Min(float64(order.Quantity), float64(tempQuantity)))

			models.ORDERBOOK[stockSymbol].Yes[10-price].Orders[user] = models.Order{
				Type:     order.Type,
				Quantity: order.Quantity - toTake,
			}
			yesPriceVal := models.ORDERBOOK[stockSymbol].Yes[10-price]
			yesPriceVal.Total -= toTake
			models.ORDERBOOK[stockSymbol].Yes[10-price] = yesPriceVal
			tempQuantity -= toTake

			if order.Type == "sell" {
				yesVal := models.STOCK_BALANCES[user][stockSymbol]
				yesVal.Yes.Locked -= toTake
				models.STOCK_BALANCES[user][stockSymbol] = yesVal

				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance + int(float64(toTake)*(10-price)*100),
					Locked:  models.INR_BALANCES[user].Locked,
				}
			} else if order.Type == "reverted" {
				noVal := models.STOCK_BALANCES[user][stockSymbol]
				noVal.No.Quantity += toTake
				models.STOCK_BALANCES[user][stockSymbol] = noVal
				models.INR_BALANCES[user] = models.UserINRBalance{
					Balance: models.INR_BALANCES[user].Balance,
					Locked:  models.INR_BALANCES[user].Locked - int(float64(toTake)*(10-price)*100),
				}
			}

			if models.ORDERBOOK[stockSymbol].Yes[10-price].Orders[user].Quantity == 0 {
				delete(models.ORDERBOOK[stockSymbol].Yes[10-price].Orders, user)
			}
		}

		if models.ORDERBOOK[stockSymbol].Yes[10-price].Total == 0 {
			delete(models.ORDERBOOK[stockSymbol].Yes, 10-price)
		}
	}

	if tempQuantity > 0 {
		mintOppositeStock(stockSymbol, price, tempQuantity, userId, "no")
	}

	initializeStockBalance(userId, stockSymbol)

	stockVal := models.STOCK_BALANCES[userId][stockSymbol]
	stockVal.No.Quantity += quantity - tempQuantity
	models.STOCK_BALANCES[userId][stockSymbol] = stockVal

	models.INR_BALANCES[userId] = models.UserINRBalance{
		Balance: models.INR_BALANCES[userId].Balance,
		Locked:  models.INR_BALANCES[userId].Locked - int(float64(quantity-tempQuantity)*price*100),
	}

	res, err := ConvertIndividualOrderBookToJSON(stockSymbol)

	if err != nil {
		HandleNilError(err)
	}

	return map[string]interface{}{
		"message":   fmt.Sprintf("Buy order for 'no' added for %s", stockSymbol),
		"orderbook": res,
	}
}

func SellYesOption(userId string, stockSymbol string, quantity int, price float64) map[string]interface{} {
	if _, ok := models.ORDERBOOK[stockSymbol]; !ok {
		return map[string]interface{}{"msg": "Invalid stock symbol"}
	}

	if models.STOCK_BALANCES[userId][stockSymbol].Yes.Quantity < quantity {
		return map[string]interface{}{"error": `Insufficient "yes" stocks to sell`}
	}

	yesVal := models.STOCK_BALANCES[userId][stockSymbol]
	yesVal.Yes.Quantity -= quantity
	yesVal.Yes.Locked += quantity
	models.STOCK_BALANCES[userId][stockSymbol] = yesVal

	remainingQuantity := quantity
	opposingPrice := 10 - price

	for p, priceLevel := range models.ORDERBOOK[stockSymbol].No {
		if remainingQuantity <= 0 {
			break
		}
		if float64(p) > opposingPrice {
			continue
		}

		for user, order := range priceLevel.Orders {
			if remainingQuantity <= 0 {
				break
			}

			availableQuantity := order.Quantity
			matchedQuantity := int(math.Min(float64(availableQuantity), float64(remainingQuantity)))

			priceLevel.Orders[user] = models.Order{
				Type:     order.Type,
				Quantity: availableQuantity - matchedQuantity,
			}
			priceLevel.Total -= matchedQuantity
			remainingQuantity -= matchedQuantity

			if models.STOCK_BALANCES[user][stockSymbol].No.Quantity > 0 {
				noVal := models.STOCK_BALANCES[user][stockSymbol]
				noVal.No.Locked -= matchedQuantity
				models.STOCK_BALANCES[user][stockSymbol] = noVal
			}

			individualBalance := models.INR_BALANCES[user]
			individualBalance.Balance += int(float64(matchedQuantity)*p) * 100
			models.INR_BALANCES[user] = individualBalance
		}

		if priceLevel.Total == 0 {
			delete(models.ORDERBOOK[stockSymbol].No, p)
		}
	}

	indBalance := models.INR_BALANCES[userId]
	indBalance.Balance += int(float64(quantity-remainingQuantity)*price) * 100
	models.INR_BALANCES[userId] = indBalance

	yesLocked := models.STOCK_BALANCES[userId][stockSymbol]
	yesLocked.Yes.Locked -= (quantity - remainingQuantity)
	models.STOCK_BALANCES[userId][stockSymbol] = yesLocked

	if remainingQuantity > 0 {
		if _, ok := models.ORDERBOOK[stockSymbol].Yes[price]; !ok {
			models.ORDERBOOK[stockSymbol].Yes[price] = models.PriceLevel{
				Total:  0,
				Orders: make(map[string]models.Order),
			}
		}

		if _, ok := models.ORDERBOOK[stockSymbol].Yes[price].Orders[userId]; !ok {
			models.ORDERBOOK[stockSymbol].Yes[price].Orders[userId] = models.Order{
				Quantity: 0,
				Type:     "sell",
			}
		}

		yesPrice := models.ORDERBOOK[stockSymbol].Yes[price]
		yesPrice.Total += remainingQuantity
		models.ORDERBOOK[stockSymbol].Yes[price] = yesPrice

		indOrders := models.ORDERBOOK[stockSymbol].Yes[price].Orders[userId]
		indOrders.Quantity += remainingQuantity
		models.ORDERBOOK[stockSymbol].Yes[price].Orders[userId] = indOrders
	}

	res, err := ConvertIndividualOrderBookToJSON(stockSymbol)

	if err != nil {
		HandleNilError(err)
	}

	return map[string]interface{}{
		"message":   fmt.Sprintf("Sell order for 'yes' stock placed for %s", stockSymbol),
		"orderbook": res,
	}
}

func SellNoOption(userId string, stockSymbol string, quantity int, price float64) map[string]interface{} {
	if _, ok := models.ORDERBOOK[stockSymbol]; !ok {
		return map[string]interface{}{"msg": "Invalid stock symbol"}
	}

	if models.STOCK_BALANCES[userId][stockSymbol].No.Quantity < quantity {
		return map[string]interface{}{"error": `Insufficient "no" stocks to sell`}
	}

	indStock := models.STOCK_BALANCES[userId][stockSymbol]
	indStock.No.Quantity -= quantity
	indStock.No.Locked += quantity
	models.STOCK_BALANCES[userId][stockSymbol] = indStock

	remainingQuantity := quantity
	opposingPrice := 10 - price

	for p, priceLevel := range models.ORDERBOOK[stockSymbol].Yes {
		if remainingQuantity <= 0 {
			break
		}
		if float64(p) > opposingPrice {
			continue
		}

		for user, order := range priceLevel.Orders {
			if remainingQuantity <= 0 {
				break
			}

			availableQuantity := order.Quantity
			matchedQuantity := int(math.Min(float64(availableQuantity), float64(remainingQuantity)))

			priceLevel.Orders[user] = models.Order{
				Type:     order.Type,
				Quantity: availableQuantity - matchedQuantity,
			}
			priceLevel.Total -= matchedQuantity
			remainingQuantity -= matchedQuantity

			if models.STOCK_BALANCES[user][stockSymbol].Yes.Quantity > 0 {
				yesLocked := models.STOCK_BALANCES[user][stockSymbol]
				yesLocked.Yes.Locked -= matchedQuantity
				models.STOCK_BALANCES[user][stockSymbol] = yesLocked
			}

			indInr := models.INR_BALANCES[user]
			indInr.Balance += int(float64(matchedQuantity)*p) * 100
			models.INR_BALANCES[user] = indInr
		}

		if priceLevel.Total == 0 {
			delete(models.ORDERBOOK[stockSymbol].Yes, p)
		}
	}

	indBalance := models.INR_BALANCES[userId]
	indBalance.Balance += int(float64(quantity-remainingQuantity)*price) * 100
	models.INR_BALANCES[userId] = indBalance

	individualStock := models.STOCK_BALANCES[userId][stockSymbol]
	individualStock.No.Locked -= (quantity - remainingQuantity)
	models.STOCK_BALANCES[userId][stockSymbol] = individualStock

	if remainingQuantity > 0 {
		if _, ok := models.ORDERBOOK[stockSymbol].No[price]; !ok {
			models.ORDERBOOK[stockSymbol].No[price] = models.PriceLevel{
				Total:  0,
				Orders: make(map[string]models.Order),
			}
		}

		if _, ok := models.ORDERBOOK[stockSymbol].No[price].Orders[userId]; !ok {
			models.ORDERBOOK[stockSymbol].No[price].Orders[userId] = models.Order{
				Quantity: 0,
				Type:     "sell",
			}
		}

		indNoQuant := models.ORDERBOOK[stockSymbol].No[price]
		indNoQuant.Total += remainingQuantity
		models.ORDERBOOK[stockSymbol].No[price] = indNoQuant

		indOrder := models.ORDERBOOK[stockSymbol].No[price].Orders[userId]
		indOrder.Quantity += remainingQuantity
		models.ORDERBOOK[stockSymbol].No[price].Orders[userId] = indOrder
	}

	res, err := ConvertIndividualOrderBookToJSON(stockSymbol)

	if err != nil {
		HandleNilError(err)
	}

	return map[string]interface{}{
		"message":   fmt.Sprintf("Sell order for 'no' stock placed for %s", stockSymbol),
		"orderbook": res,
	}
}
