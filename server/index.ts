import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import caloriesRouter from "./Routes/calories";
import accountsRouter from "./Routes/accounts";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;

//Mongodb connection string
const uri = String(process.env.CONNECTION_STRING);
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB server connected");
});

app.use("/calories", caloriesRouter);
app.use("/accounts", accountsRouter);

app.listen(PORT, () => {
  console.log("Hello world!");
});
