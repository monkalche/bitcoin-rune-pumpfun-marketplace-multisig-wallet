import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cron from "node-cron";
import etchingRoutes from "./routes/etchingRoutes";
import txRoutes from "./routes/txRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { checkTxStatus } from "./controller/etchingController";
import { checkTxListStatus } from "./controller/txController";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 6000;

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(async () => {
    console.log("Connected to the database! ❤️");
    app.listen(port, async () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Cannot connect to the database! 😭", err);
    process.exit();
  });

app.get("/", (req: Request, res: Response) => {
  res.send("<h3>Pump Fun API is up and running.</h3>");
});

app.use("/api/etching", etchingRoutes);
app.use("/api/swap", txRoutes);
app.use("/api/dashboard", dashboardRoutes);

cron.schedule("*/5 * * * *", () => {
  console.log("Update Tx Status Every 5 mins");
  checkTxStatus();
  checkTxListStatus();
});
