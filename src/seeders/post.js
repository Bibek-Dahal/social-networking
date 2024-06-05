import { Post } from "../models/post.js";
import { faker } from "@faker-js/faker";
import { User } from "../models/user.js";
const posts = [];
let userIds = [];

const fetchUserId = async () => {
  const users = await User.find({});

  userIds = users.map((item) => item.id);
};

const fillPosts = () => {
  for (let i = 0; i < 1000; i++) {
    const user = userIds[Math.floor(Math.random() * 140)];
    const title = faker.lorem.sentence(5);
    const description = faker.lorem.sentence(10);
    const date = faker.date.anytime;
    const createdAt = date;
    const updatedAt = date;
    const data = {
      user: user,
      title: title,
      description: description,
      createdAt: "2024-06-03T06:23:05.342+00:00",
      updatedAt: "2024-06-03T06:23:05.342+00:00",
    };
    posts.push(data);
  }
};

export const seedPost = async (req, res) => {
  await fetchUserId();
  fillPosts();
  //   console.log(posts);
  console.log("insertig posts...");
  try {
    // for (const post of posts) {
    await Post.create(posts);
    console.log("Post inserted successfully");
    // }
    // await User.bulkSave(users);
  } catch (error) {
    console.log("Cant insert users", error);
  }
};
