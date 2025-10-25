import Stock from "../models/Stock.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";

const roundToTwoDecimals = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const generateStockData = async (symbol) => {
  const stock = await Stock.findOne({ symbol });
  if (!stock) {
    throw new NotFoundError(`Stock with symbol ${symbol} not found`);
  }

  const now = new Date();
  const minChange = -0.02;
  const maxChange = 0.02;
  const trendChange = 0.005;
  const currentPrice = stock.currentPrice;

  const trendType = Math.random();
  let trendModifier = 0;

  if (trendType < 0.33) {
    //sideways trend: no additional change
    trendModifier = 0;
  } else if (trendType > 0.66) {
    //Uptrend : positive bias
    trendModifier = trendChange;
  } else {
    //Downtrend : negative bias
    trendModifier = -trendChange;
  }
  const changePercentage =
    Math.random() * (maxChange - minChange) + minChange + trendModifier;

  const close = roundToTwoDecimals(currentPrice * (1 + changePercentage));

  const patternType = Math.random();

  let high, low;

  if (patternType < 0.15) {
    //Marubozu pattern
    high = Math.max(currentPrice, close);
    low = Math.min(currentPrice, close);
  } else if (patternType < 0.3) {
    high = Math.max(currentPrice, close);
    low = Math.min(currentPrice, close) - Math.random() * 2;
  } else if (patternType < 0.45) {
    //Inverted hammer pattern
    high = Math.max(currentPrice, close) + Math.random() * 2;
    low = Math.min(currentPrice, close);
  } else if (patternType < 0.6) {
    //Shooting star pattern
    high = Math.max(currentPrice, close) + Math.random() * 2;
    low = Math.min(currentPrice, close);
  } else {
    if (Math.random() < 0.5) {
      high = close + Math.random() * 4; //Long bullish candle
      low = close - Math.random() * 2;
    } else {
      high = close + Math.random() * 2;
      low = close - Math.random() * 4; //long bearish candle
    }
  }

  high = roundToTwoDecimals(high);
  low = roundToTwoDecimals(low);

  const timestamp = now.toISOString();
  const time = now.getTime() / 1000;
  const lastItem = stock.dayTimeSeries[stock.dayTimeSeries.length - 1];

  if (!lastItem || now - new Date(lastItem.timestamp) > 1 * 60 * 1000) {
    //1 min interval
    stock.dayTimeSeries.push({
      timestamp,
      time,
      _internal_originalTime: time,
      open: roundToTwoDecimals(currentPrice),
      high,
      low,
      close,
    });
  } else {
    const updateHigh = Math.max(lastItem.high, close + Math.random() * 1);
    const updateLow = Math.min(lastItem.low, close - Math.random() * 1);

    const updateCandle = {
      high: roundToTwoDecimals(updateHigh),
      low: roundToTwoDecimals(updateLow),
      close: roundToTwoDecimals(close),
      open: lastItem.open,
      timestamp: lastItem.timestamp,
      time: lastItem.time,
      _internal_originalTime: lastItem._internal_originalTime,
    };
    stock.dayTimeSeries[stock.dayTimeSeries.length - 1] = updateCandle;
  }

  stock.dayTimeSeries = stock.dayTimeSeries.slice(-390);
  stock.currentPrice = close;
  try {
    await stock.save();
  } catch (error) {
    console.log("Skipping conflicts");
  }
};


const store10Min = async (symbol) => {
    const stock = await Stock.findOne({symbol});
    if(!stock){
        throw new NotFoundError(`Stock not found`);
    }
    const now = new Date();
    const currentPrice = stock.currentPrice;
    const lastestItem = stock.dayTimeSeries[stock.dayTimeSeries.length - 1];
    
    const timestamp = now.toISOString();
    const time = now.getTime() / 1000;

    stock.tenMinTimeSeries.push({
        timestamp,
        time,
        _internal_originalTime : time,
        open : roundToTwoDecimals(currentPrice),
        high : roundToTwoDecimals(lastestItem.high),
        low : roundToTwoDecimals(lastestItem.low),
        close : roundToTwoDecimals(lastestItem.close)
    });

    try {
        await stock.save();
    } catch (error) {
        console.log("Skipping conflicts");  
    }
}

export {generateStockData,store10Min};