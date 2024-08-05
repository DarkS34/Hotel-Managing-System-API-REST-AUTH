const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected");
  } catch (err) {
    console.log("Failed to connect: ", err);
  }
};

module.exports = { connectDB };
