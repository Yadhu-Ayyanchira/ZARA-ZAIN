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
const addressController = require("../controllers/addressController");
const orderController = require("../controllers/orderController");



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

user_route.get("/showProduct/:id",auth.isBlock, userController.loadShowproduct);
user_route.get("/shop",auth.isBlock, userController.loadShop);
user_route.post("/verifyOtp", userController.verifyLoad);

user_route.get("/userProfile",auth.isBlock, auth.isLogin, userController.loadProfile);

user_route.get("/cart",auth.isBlock, auth.isLogin, cartController.loadCart);
user_route.post("/addToCart",auth.isBlock, auth.isLogin, cartController.addToCart);
user_route.get("/removeProduct", cartController.removeProduct);
user_route.post(
  "/changeQuantity",
  auth.isLogin,
  cartController.changeProductCount
);
user_route.get("/checkout", auth.isLogin, cartController.loadCheckout);
user_route.get("/addAddress", auth.isLogin, cartController.loadAddAddress);
user_route.post("/addAddress", addressController.insertAddress);
user_route.post("/deleteAddress",auth.isBlock , auth.isLogin, addressController.deleteAddress);
user_route.get('/editAddress/:id',auth.isLogin,addressController.loadEditAddress)
user_route.post('/editAddress/:id',auth.isLogin,addressController.editAddress)
user_route.post('/checkout', auth.isLogin,orderController.placeOrder)
user_route.post('/verify-payment',auth.isLogin,orderController.verifyPayment)
user_route.get('/myOrders',auth.isLogin,orderController.loadOrder)


module.exports = user_route;
