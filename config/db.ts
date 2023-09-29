import mongoose from "mongoose";
export const connectWithDb = async () => {
  try {
    await mongoose.connect(`${process.env.DB}`);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
