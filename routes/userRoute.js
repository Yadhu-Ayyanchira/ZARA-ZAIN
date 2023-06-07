const express = require("express");
const user_route = express();
const session = require("express-session");
const nocache = require("nocache");

const dotenv = require("dotenv");
dotenv.config();

user_route.use(nocache());
user_route.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 6048000000,
    },
  })
);


user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");

const auth = require("../middleware.js/auth");
const cartController = require("../controllers/cartController");
const userController = require("../controllers/userController");

user_route.get(["/", "/index"], auth.isBlock, userController.loadHome);

user_route.get(
  "/login",
  [auth.isBlock, auth.isLogout],
  userController.loginLoad
);
user_route.post("/login", userController.verifyLogin, auth.isBlock);

user_route.get(
  "/register",
  [auth.isBlock, auth.isLogout],
  userController.loadRegister
);
user_route.post("/register", auth.isBlock, userController.insertUser);

user_route.get(
  "/logout",
  [auth.isBlock, auth.isLogin],
  userController.userLogout
);

user_route.get("/showProduct/:id", userController.loadShowproduct);
user_route.get("/shop", userController.loadShop);
user_route.post("/verifyOtp", userController.verifyLoad);

user_route.get("/userProfile", auth.isLogin, userController.loadProfile);

user_route.get("/cart", auth.isLogin, cartController.loadCart);
user_route.post("/addToCart", auth.isLogin, cartController.addToCart);
user_route.get("/removeProduct", cartController.removeProduct);
user_route.post("/changeQuantity", cartController.changeProductCount);

module.exports = user_route;
