import { Request, Response } from 'express';
import { INR_BALANCES, resetInrbalance, resetStockbalance, STOCK_BALANCES } from '../models/balances';
import { INRBalance } from '../types/balances';
import { ORDERBOOK, resetOrderbook } from '../models/orderbook';

export const createUser = (userId:string) => {
    console.log("user id inside create user method is ",userId)
    if (INR_BALANCES[userId]) {
        return {error:true, msg:"User already exists"};
    }
    INR_BALANCES[userId] = { balance: 0, locked: 0 } as INRBalance;
    STOCK_BALANCES[userId] = {}
    return { error:false, msg: `User ${userId} created successfully`, balance: INR_BALANCES }
};

export const getINRBalance = () => {
    return {error:false, msg: INR_BALANCES}
};

export const getIndividualBalance = (userId:string) => {
    const balance = INR_BALANCES[userId];
    if (!balance) {
        return {error:true, msg: `User ${userId} not found`}
    }
    return {error:false, msg: balance}
};

export const onrampINR = (userId: string, amount: number) => {
    if (!INR_BALANCES[userId]) {
        return {error:true, msg: `User ${userId} not found`}
    }
    INR_BALANCES[userId].balance += amount;
    return {error: false,  msg: `INR ${amount / 100} added to user ${userId}`, balance: INR_BALANCES[userId] };
};


export const resetAll = () => {
    resetOrderbook()
    resetInrbalance()
    resetStockbalance()

    return {error:false, msg:"Orderbook, stock balances and inr balances resetted successfully" }
}