import { Request, Response } from 'express';
import { INR_BALANCES, resetInrbalance, resetStockbalance, STOCK_BALANCES } from '../models/balances';
import { INRBalance } from '../types/balances';
import { ORDERBOOK, resetOrderbook } from '../models/orderbook';

export const createUser = (userId:string) => {
    console.log("user id inside create user method is ",userId)
    if (INR_BALANCES[userId]) {
        return "User already exists";
    }
    INR_BALANCES[userId] = { balance: 0, locked: 0 } as INRBalance;
    STOCK_BALANCES[userId] = {}
    return "User created successfully"
};

export const getINRBalance = () => {
    return INR_BALANCES
};

export const getIndividualBalance = (userId:string) => {
    const balance = INR_BALANCES[userId];
    if (!balance) {
        return "user not found"
    }
    return balance
};

export const onrampINR = (userId: string, amount: number) => {
    if (!INR_BALANCES[userId]) {
        return "User not found"
    }
    INR_BALANCES[userId].balance += amount;
    return { message: `INR ${amount / 100} added to user ${userId}`, balance: INR_BALANCES[userId] };
};


export const resetAll = () => {
    resetOrderbook()
    resetInrbalance()
    resetStockbalance()

    return {message:"Orderbook, stock balances and inr balances resetted successfully"}
}