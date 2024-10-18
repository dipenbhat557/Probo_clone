const axios = require('axios');
const WebSocket = require('ws');

const HTTP_SERVER_URL = 'http://localhost:3000';
const WS_SERVER_URL = 'ws://localhost:8080';

describe('Trading System Tests', () => {
  let ws;

  beforeAll((done) => {
    ws = new WebSocket(WS_SERVER_URL);
    ws.on('open', done);
  });

  afterAll(() => {
    ws.close();
  });

  beforeEach(async () => {
    await axios.post(`${HTTP_SERVER_URL}/reset`);
  });

  const waitForWSMessage = () => {
    return new Promise((resolve) => {
      ws.once('message', (data) => {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      });
    });
  };

  test('Create user, onramp INR, and check balance', async () => {
    const userId = 'testUser1';
    await axios.post(`${HTTP_SERVER_URL}/user/create/${userId}`);
    
    const onrampResponse = await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId,
      amount: 1000000 
    });
    
    expect(onrampResponse.status).toBe(200);

    const balanceResponse = await axios.get(`${HTTP_SERVER_URL}/balance/inr/${userId}`);
    expect(balanceResponse.data.msg).toEqual({ balance: 1000000, locked: 0 });
  });

  test('Create symbol and check orderbook', async () => {
    const symbol = 'TEST_SYMBOL_30_Dec_2024';
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);

    const orderbookResponse = await axios.get(`${HTTP_SERVER_URL}/orderbook/${symbol}`);
    expect(orderbookResponse.data.msg).toEqual({ yes: {}, no: {} });
  });

  test('Place buy order for yes stock and check WebSocket response', async () => {
    const userId = 'testUser2';
    const symbol = 'BTC_USDT_10_Oct_2024_9_30';
    await axios.post(`${HTTP_SERVER_URL}/user/create/${userId}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, { userId, amount: 1000000 });

    await ws.send(JSON.stringify({type:"subscribe",stockSymbol:"BTC_USDT_10_Oct_2024_9_30"}))

    const buyOrderResponse = await axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId,
      stockSymbol: symbol,
      quantity: 100,
      price: 850,
      stockType: 'yes'
    });

    const wsMessage = await waitForWSMessage();

    expect(buyOrderResponse.status).toBe(200);
    expect(wsMessage.event).toBe('event_orderbook_update');
    const message = JSON.parse(wsMessage.message);
    expect(message.no['1.5']).toEqual({
      total: 100,
      orders: { 
        [userId]: { 
          type: "reverted",
          quantity: 100 
        } 
      }
    });
  });

  test('Place sell order for no stock and check WebSocket response', async () => {
    const userId = 'testUser3';
    const symbol = 'ETH_USDT_15_Nov_2024_14_00';
    await axios.post(`${HTTP_SERVER_URL}/user/create/${userId}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
      userId,
      stockSymbol: symbol,
      quantity: 200
    });

    await ws.send(JSON.stringify({type:"subscribe",stockSymbol:"ETH_USDT_15_Nov_2024_14_00"}))

    const sellOrderResponse = await axios.post(`${HTTP_SERVER_URL}/order/sell`, {
      userId,
      stockSymbol: symbol,
      quantity: 100,
      price: 200,
      stockType: 'no'
    });

    const wsMessage = await waitForWSMessage();

    expect(sellOrderResponse.status).toBe(200);
    expect(wsMessage.event).toBe('event_orderbook_update');
    const message = JSON.parse(wsMessage.message);
    expect(message.no['2']).toEqual({
      total: 100,
      orders: { 
        [userId]: { 
          type: "sell",
          quantity: 100 
        } 
      }
    });
  });

  test('Execute matching orders and check WebSocket response', async () => {
    const buyerId = 'buyer1';
    const sellerId = 'seller1';
    const symbol = 'AAPL_USDT_20_Jan_2025_10_00';
    const price = 950;
    const quantity = 50;
  
      await axios.post(`${HTTP_SERVER_URL}/user/create/${buyerId}`);
      await axios.post(`${HTTP_SERVER_URL}/user/create/${sellerId}`);
      await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
      await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, { userId: buyerId, amount: 1000000 });
      await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
        userId: sellerId,
        stockSymbol: symbol,
        quantity: 100
      });
 
      await ws.send(JSON.stringify({ type: "subscribe", stockSymbol: symbol }));
  
      await axios.post(`${HTTP_SERVER_URL}/order/sell`, {
        userId: sellerId,
        stockSymbol: symbol,
        quantity,
        price,
        stockType: 'yes'
      });
      
      await waitForWSMessage()
  
      await axios.post(`${HTTP_SERVER_URL}/order/buy`, {
        userId: buyerId,
        stockSymbol: symbol,
        quantity,
        price,
        stockType: 'yes'
      });
  
      const executionWsMessage = await waitForWSMessage(); 
  
      expect(executionWsMessage.event).toBe('event_orderbook_update');
      expect(executionWsMessage.yes?.[price/100]).toBeUndefined();
  
      const buyerStockBalance = await axios.get(`${HTTP_SERVER_URL}/balance/stock/${buyerId}`);
      const sellerInrBalance = await axios.get(`${HTTP_SERVER_URL}/balance/inr/${sellerId}`);
  
      expect(buyerStockBalance.data.msg[symbol].yes.quantity).toBe(quantity);
      expect(sellerInrBalance.data.msg.balance * 100).toBe(price * quantity);
  });
});
