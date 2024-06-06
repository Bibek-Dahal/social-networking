import express from "express";
import { connectDb } from "./src/config/connect_db.js";
import bodyParser from "body-parser";
import auth from "./src/routes/auth.js";
import user from "./src/routes/user.js";
import profile from "./src/routes/profile.js";
import post from "./src/routes/post.js";
import comment from "./src/routes/comment.js";
import home from "./src/routes/home.js";
import like from "./src/routes/like.js";
import adminUser from "./src/routes/admin/user.js";
import adminPost from "./src/routes/admin/post.js";
import "./src/passport/stratigies/jwt_strategy.js";
import { seedUsers } from "./src/seeders/user.js";
import { seedPost } from "./src/seeders/post.js";
export const baseDir = process.cwd();
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
app.use("/api/home", home);
app.use("/api/like", like);

app.use("/api/admin/users", adminUser);
app.use("/api/admin/posts", adminPost);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

connectDb().then(() => {
  // seedPost();
});

app.listen(PORT, () => {
  console.log(`App listening on PORT:${PORT}`);
});
