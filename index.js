const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO);

const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for user routes

const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for admin

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.listen(3000, function () {
  console.log("Server running");
});