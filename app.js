import express from "express";
import { connectDb } from "./src/dbconfig/connect_db.js";
import bodyParser from "body-parser";
import auth from "./src/routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8000;

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/account", auth);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

connectDb();

app.listen(PORT, () => {
  console.log(`App listening on PORT:${PORT}`);
});
