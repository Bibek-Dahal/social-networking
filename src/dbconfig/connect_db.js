import mongoose from "mongoose";
import "dotenv/config";
export const connectDb = async () => {
  const dbPass = encodeURIComponent(process.env.DB_PASSWORD);

  const mongoUrl = `mongodb+srv://bibek:${dbPass}@cluster0.ruptepi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  try {
    await mongoose.connect(mongoUrl, {
      autoIndex: true,
    });
    console.log("db connected successfully");
  } catch (error) {
    console.log("cant connect to db", error);
  }
};
