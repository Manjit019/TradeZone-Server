import express from "express";
import {
  getAllStocks,
  getStockBySymbol,
  registerStock,
} from "../controllers/stock/stock.js";
import {
  buyStock,
  getAllHoldings,
  sellStock,
} from "../controllers/stock/holding.js";
import { getOrder } from "../controllers/stock/order.js";

const router = express.Router();

router.get("", getAllStocks);
router.get("/stock", getStockBySymbol);
router.post("/register", registerStock);
router.post("/buy", buyStock);
router.post("/sell", sellStock);
router.get("/order", getOrder);
router.get("/holding", getAllHoldings);

export default router;
