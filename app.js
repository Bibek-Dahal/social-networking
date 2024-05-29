import express from "express";
import { connectDb } from "./src/dbconfig/connect_db.js";
const app = express();

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
  res.send("Hello World");
});

connectDb();

app.listen(PORT, () => {
  console.log(`App listening on PORT:${PORT}`);
});
