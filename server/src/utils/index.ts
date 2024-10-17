import { Request, Response } from "express";
import { redisClient, requestQueue, responseQueue } from "..";
import { randomUUID } from "crypto";

export const createUser = async (req: Request, res: Response) => {
    const {userId} = req.params
    const uid = randomUUID()
    console.log("got the request")
    const data = {method:"createUser", uid:uid, payload: userId};
    console.log("order data is in create user method in server ",data)

    await redisClient.lPush(requestQueue, JSON.stringify(data))
    console.log("completed sending pushing")
    const response = await redisClient.brPop(`${responseQueue}/${uid}`, 0)

    console.log("response from create user method is ",response)
    res.send(response?.element)

}

export const createSymbol = async (req:Request, res: Response) => {
    const {stockSymbol} = req.params;
    const uid = randomUUID();
    const data = {method:"createSymbol", uid:uid, payload: stockSymbol}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const viewOrderbook = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = {method:"viewOrderbook", uid:uid}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const getINRBalance = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = {method:"getINRBalance", uid:uid}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const getStockBalance = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = {method:"getStockBalance", uid:uid}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const resetAll = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = {method:"resetAll", uid:uid}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const getIndividualBalance = async (req: Request, res: Response) => {
    const {userId} = req.params
    const uid = randomUUID();
    const data = {method:"getIndividualBalance", uid:uid, userId: userId}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const onrampINR = async (req: Request, res: Response) => {
    const {userId, amount} = req.body;
    const uid = randomUUID();
    const data = {method:"onrampINR", uid:uid,  payload: {userId:userId, amount:amount}}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const getIndividualStockBalance = async (req: Request, res: Response) => {
    const {userId} = req.params
    const uid = randomUUID();
    const data = {method:"getIndividualStockBalance", uid:uid, userId: userId}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const buyOption = async (req: Request, res: Response) => {
    const {
        userId,
        stockSymbol,
        quantity,
        price: originalPrice,
        stockType,
      } = req.body;
      const price = originalPrice / 100;
    const uid = randomUUID();
    const data = {method:"buyOption", uid:uid, payload: {userId:userId, stockSymbol: stockSymbol, quantity:quantity, price: price, stockType:stockType}}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const sellOption = async (req: Request, res: Response) => {
    const {
        userId,
        stockSymbol,
        quantity,
        price: originalPrice,
        stockType,
      } = req.body;
      const price = originalPrice / 100;
    const uid = randomUUID();
    const data = {method:"sellOption", uid:uid, payload: {userId:userId, stockSymbol: stockSymbol, quantity:quantity, price: price, stockType:stockType}}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const viewIndividualOrderbook = async (req: Request, res: Response) => {
    const {stockSymbol} = req.params
    const uid = randomUUID();
    const data = {method:"viewIndividualOrderbook", uid:uid, stockSymbol: stockSymbol}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}

export const mintTrade = async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity } = req.body;
    const uid = randomUUID();
    const data = {method:"mintTrade", uid:uid, payload: {userId: userId, stockSymbol: stockSymbol, quantity: quantity}}
    await redisClient.lPush(requestQueue, JSON.stringify(data))

    const response = await redisClient.brPop(`${responseQueue}/${uid}`,0)
    res.send(response?.element)
}
