require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/db");
const usersRouter = require("./api/routes/users");
const accommodationsRouter = require("./api/routes/accommodation");
const hotelsRouter = require("./api/routes/hotel");

const port = 3000;
const app = express();

connectDB();

app.use(express.json());

app.use("/api/v1/accommodations", accommodationsRouter);
app.use("/api/v1/hotels", hotelsRouter);
app.use("/api/v1/users", usersRouter);

app.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});

app.listen(port, () => {
  console.log("Server: http://localhost:" + port);
});
