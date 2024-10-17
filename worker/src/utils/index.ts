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
            processedData = await createUser(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "createSymbol":
            processedData = await createSymbol(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "viewOrderbook":
            processedData = await viewOrderbook();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getINRBalance":
            processedData = await getINRBalance();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getStockBalance":
            processedData = await getStockBalance();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "resetAll":
            processedData = await resetAll();
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getIndividualBalance":
            processedData = await getIndividualBalance(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "onrampINR":
            processedData = await onrampINR(orderData.payload.userId, orderData.payload.amount);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "getIndividualStockBalance":
            processedData = await getIndividualStockBalance(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "buyOption":
            const { userId, stockSymbol, quantity, price, stockType } = orderData.payload;
            processedData = await buyOption(userId, stockSymbol, quantity, price, stockType);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "sellOption":
            processedData = await sellOption(orderData.payload.userId, orderData.payload.stockSymbol, orderData.payload.quantity, orderData.payload.price, orderData.payload.stockType);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "viewIndividualOrderbook":
            processedData = await viewIndividualOrderbook(orderData.payload);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        case "mintTrade":
            processedData = await mintTrade(orderData.payload.userId, orderData.payload.stockSymbol, orderData.payload.quantity);
            await publisher.publish(`response.${orderData.uid}`, JSON.stringify(processedData));
            break;
        default:
            await publisher.publish(`response.${orderData.uid}`, "Method not available");
    }
}
