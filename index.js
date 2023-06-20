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

// Routes
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

app.use("/", userRoute);
app.use("/admin", adminRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.render('404');
});

app.listen(3000, function () {
  console.log("Server running");
});
