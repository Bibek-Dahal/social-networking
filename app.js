import express from "express";
import { connectDb } from "./src/config/connect_db.js";
import bodyParser from "body-parser";
import auth from "./src/routes/auth.js";
import user from "./src/routes/user.js";
import profile from "./src/routes/profile.js";
import post from "./src/routes/post.js";
import comment from "./src/routes/comment.js";
import "./src/passport/stratigies/jwt_strategy.js";
const app = express();
const PORT = process.env.PORT || 8000;

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/account", auth);
app.use("/api/user", user);
app.use("/api/profile", profile);
app.use("/api/post", post);
app.use("/api/comment", comment);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

connectDb();

app.listen(PORT, () => {
  console.log(`App listening on PORT:${PORT}`);
});
