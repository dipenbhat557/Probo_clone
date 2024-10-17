import { redisClient, responseQueue } from "..";
import { buyOption, sellOption, viewIndividualOrderbook, viewOrderbook } from "../controllers/orderController";
import { createSymbol, getIndividualStockBalance, getStockBalance, mintTrade } from "../controllers/stockController";
import { createUser, getIndividualBalance, getINRBalance, onrampINR, resetAll } from "../controllers/userController";

export async function processOrder(orderData: any) {
    let processedData;
    console.log("reached processOrder with ",orderData)

    switch(orderData?.method){
        case "createUser":
            processedData = createUser(orderData.payload)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "createSymbol":
            processedData = createSymbol(orderData.payload)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "viewOrderbook":
            processedData = viewOrderbook()
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "getINRBalance":
            processedData = getINRBalance()
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "getStockBalance":
            processedData = getStockBalance()
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "resetAll":
            processedData = resetAll()
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "getIndividualBalance":
            processedData = getIndividualBalance(orderData.payload)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "onrampINR":
            processedData = onrampINR(orderData.payload.userId, orderData.payload.amount)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "getIndividualStockBalance":
            processedData = getIndividualStockBalance(orderData.payload)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "buyOption":
            let {userId, stockSymbol, quantity, price, stockType} = orderData.payload
            processedData = buyOption(userId, stockSymbol, quantity, price, stockType)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "sellOption":
            processedData = sellOption(orderData.payload.userId, orderData.payload.stockSymbol, orderData.payload.quantity, orderData.payload.price, orderData.payload.stockType)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "viewIndividualOrderbook":
            processedData = viewIndividualOrderbook(orderData.payload)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        case "mintTrade":
            processedData = mintTrade(orderData.payload.userId, orderData.payload.stockSymbol, orderData.payload.quantity)
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`, JSON.stringify(processedData) || "The processed data is empty")
            break;
        default:
            await redisClient.lPush(`${responseQueue}/${orderData.uid}`,"Method not available")
    }

  }