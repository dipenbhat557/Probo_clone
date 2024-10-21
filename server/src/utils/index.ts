import { Request, Response } from "express";
import { redisClient, requestQueue, subscriber } from "..";
import { randomUUID } from "crypto";

const sendResponse = (res: Response, payload: any) => {
    try {
        const { error, ...data } = JSON.parse(payload);
        if (error) {
            res.status(404).json(data);
        } else {
            res.status(200).json(data);
        }
    } catch (err) {
        res.status(500).json({ error: "Invalid response from server" });
    }
};
const handlePubSub = (uid: string): Promise<any> => {
    return new Promise((resolve) => {
        const channel = `response.${uid}`;

        subscriber.subscribe(channel, (data) => {
            resolve(data)
        });
    });
};
;

export const createUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const uid = randomUUID();
    const data = { method: "createUser", uid: uid, payload: userId };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const createSymbol = async (req: Request, res: Response) => {
    const { stockSymbol } = req.params;
    const uid = randomUUID();
    const data = { method: "createSymbol", uid: uid, payload: stockSymbol };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const viewOrderbook = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = { method: "viewOrderbook", uid: uid };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const getINRBalance = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = { method: "getINRBalance", uid: uid };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const getStockBalance = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = { method: "getStockBalance", uid: uid };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const resetAll = async (req: Request, res: Response) => {
    const uid = randomUUID();
    const data = { method: "resetAll", uid: uid };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const getIndividualBalance = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const uid = randomUUID();
    const data = { method: "getIndividualBalance", uid: uid, payload: userId };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const onrampINR = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    const uid = randomUUID();
    const data = { method: "onrampINR", uid: uid, payload: { userId: userId, amount: amount } };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const getIndividualStockBalance = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const uid = randomUUID();
    const data = { method: "getIndividualStockBalance", uid: uid, payload: userId };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const buyOption = async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity, price, stockType } = req.body;
    const uid = randomUUID();
    const data = {
        method: "buyOption",
        uid: uid,
        payload: { userId: userId, stockSymbol: stockSymbol, quantity: quantity, price: price, stockType: stockType }
    };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const sellOption = async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity, price, stockType } = req.body;
    const uid = randomUUID();
    const data = {
        method: "sellOption",
        uid: uid,
        payload: { userId: userId, stockSymbol: stockSymbol, quantity: quantity, price: price, stockType: stockType }
    };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const viewIndividualOrderbook = async (req: Request, res: Response) => {
    const { stockSymbol } = req.params;
    const uid = randomUUID();
    const data = { method: "viewIndividualOrderbook", uid: uid, payload: stockSymbol };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};

export const mintTrade = async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity } = req.body;
    const uid = randomUUID();
    const data = {
        method: "mintTrade",
        uid: uid,
        payload: { userId: userId, stockSymbol: stockSymbol, quantity: quantity }
    };

    await redisClient.lPush(requestQueue, JSON.stringify(data));

    try {
        const response = await handlePubSub(uid);
        sendResponse(res, response);
    } catch (error) {
        res.status(500).json({ error: "Error in pub/sub communication" });
    }
};
