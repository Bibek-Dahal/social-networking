import { User } from "../models/user.js";
import { faker } from "@faker-js/faker";
import { connectDb } from "../config/connect_db.js";
const users = [];

const fillUsers = () => {
  for (let i = 0; i < 20; i++) {
    const userName = faker.person.firstName();
    const email = userName.split(".")[0] + "@gmail.com";
    const password = "Admin@123";
    const user = {
      userName: userName,
      email: email,
      password: password,
    };
    users.push(user);
  }
};

export const seedUsers = async (req, res) => {
  fillUsers();
  //   console.log(users);
  console.log("insertig usrs...");
  try {
    for (const user of users) {
      await User.create(user);
      console.log("User inserted successfully");
    }
    // await User.bulkSave(users);
  } catch (error) {
    console.log("Cant insert users", error);
  }
};
