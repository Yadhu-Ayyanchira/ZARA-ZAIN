const express = require("express");
const app = express();
require('./config/config')
const path = require("path");
app.set("view engine", "ejs");
app.set("views", "./views/user");
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
  res.render('500')
});

app.use((req, res, next) => {
  res.render('404');
  res.end();
})

app.listen(3000, function () {
  console.log("Server running");
});
