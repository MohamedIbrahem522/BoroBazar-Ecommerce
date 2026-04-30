import mongoose from "mongoose";
import { data_config } from "./config.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(data_config.database);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;