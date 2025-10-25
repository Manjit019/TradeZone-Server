import cron from "node-cron";
import Stock from "../models/Stock.js";
import { store10Min, generateStockData } from "./stockUtils";

const holidays = ["2025-12-24", "2025-11-21"];

const isTradingHour = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekday = dayOfWeek > 0 && dayOfWeek < 6; //mon-fri
  const isTradingTime =
    (now.getHours() === 9 && now.getMinutes() >= 30) ||
    (now.getHours() > 9 && now.getHours() < 15) ||
    (now.getHours() === 15 && now.getMinutes() <= 30); //9:30AM to 3:30PM

  const today = new Date().toISOString().slice(0, 10);
  return isWeekday && isTradingTime && !holidays.includes(today);
};

const isNewTradeDay = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
  const today = new Date().toISOString().slice(0, 10);
  return isWeekday && !holidays.includes(today);
};

const scheduleDayReset = () => {
  cron.schedule("15 9 * * 1-5", async () => {
    if (isNewTradeDay()) {
      await Stock.updateMany({}, [
        {
          $set: {
            dayTimeSeries: [],
            tenMinTimeSeries: [],
            lastDayTradedPrice: "$currentPrice",
          },
        },
        {
          $set: { _v: 0 },
        },
      ]);
      console.log("Day reset completed at 9:15");
    }
  });
};

const update10minCandle = () => {
  cron.schedule("*/10 * * * *", async () => {
    if (isTradingHour()) {
      const stock = await Stock.find();
      stock.forEach(async (s) => {
        await store10Min(s.symbol);
      });
    }
  });
};

const generateRandomDataEvery5Second = () => {
  cron.schedule("*/5 * * * * *", async () => {
    if (isTradingHour()) {
      const stock = await Stock.find();
      stock.forEach(async (s) => {
        await generateStockData(s.symbol);
      });
    }
  });
};

export { scheduleDayReset, update10minCandle, generateRandomDataEvery5Second };
