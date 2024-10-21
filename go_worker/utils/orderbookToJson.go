package utils

import (
	"fmt"
	"strconv"

	"github.com/dipenbhat557/probo_clone/models"
)

func convertPriceLevels(input map[float64]models.PriceLevel) map[string]models.PriceLevel {
	converted := make(map[string]models.PriceLevel)
	for price, level := range input {
		priceStr := strconv.FormatFloat(price, 'f', -1, 64)
		converted[priceStr] = level
	}
	return converted
}

func ConvertIndividualOrderBookToJSON(stockSymbol string) (map[string]interface{}, error) {
	orderbook, exists := models.ORDERBOOK[stockSymbol]
	if !exists {
		return nil, fmt.Errorf("orderbook with provided stock symbol not found")
	}

	convertedYes := convertPriceLevels(orderbook.Yes)
	convertedNo := convertPriceLevels(orderbook.No)

	convertedOrderbook := map[string]interface{}{
		"yes": convertedYes,
		"no":  convertedNo,
	}

	return convertedOrderbook, nil
}

func ConvertFullOrderBookToJSON() (map[string]interface{}, error) {
	convertedOrderbook := make(map[string]interface{})

	for stockSymbol, orderbook := range models.ORDERBOOK {
		convertedYes := convertPriceLevels(orderbook.Yes)
		convertedNo := convertPriceLevels(orderbook.No)

		convertedOrderbook[stockSymbol] = map[string]interface{}{
			"yes": convertedYes,
			"no":  convertedNo,
		}
	}

	return convertedOrderbook, nil
}
