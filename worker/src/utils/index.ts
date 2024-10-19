import {  publisher } from "..";
import { 
    buyOption, 
    sellOption, 
    viewIndividualOrderbook, 
    viewOrderbook 
} from "../controllers/orderController";
import { 
    createSymbol, 
    getIndividualStockBalance, 
    getStockBalance, 
    mintTrade 
} from "../controllers/stockController";
import { 
    createUser, 
    getIndividualBalance, 
    getINRBalance, 
    onrampINR, 
    resetAll 
} from "../controllers/userController";

export async function processOrder(orderData: any) {
    let processedData;
    console.log("Reached processOrder with: ", orderData);

    switch (orderData?.method) {
        case "createUser":
            processedData = createUser(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "createSymbol":
            processedData =  createSymbol(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "viewOrderbook":
            processedData =  viewOrderbook();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getINRBalance":
            processedData =  getINRBalance();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getStockBalance":
            processedData =  getStockBalance();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "resetAll":
            processedData =  resetAll();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getIndividualBalance":
            processedData =  getIndividualBalance(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "onrampINR":
            processedData =  onrampINR(orderData.payload.userId, orderData.payload.amount);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getIndividualStockBalance":
            processedData =  getIndividualStockBalance(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "buyOption":
            const { userId, stockSymbol, quantity, price, stockType } = orderData.payload;
            processedData =  buyOption(userId, stockSymbol, quantity, price, stockType);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "sellOption":
            processedData =  sellOption(orderData.payload.userId, orderData.payload.stockSymbol, orderData.payload.quantity, orderData.payload.price, orderData.payload.stockType);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "viewIndividualOrderbook":
            processedData =  viewIndividualOrderbook(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "mintTrade":
            processedData =  mintTrade(orderData.payload.userId, orderData.payload.stockSymbol, orderData.payload.quantity);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        default:
            await publisher.publish(`response.${orderData.uid}`, "Method not available");
    }
}
