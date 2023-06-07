const express = require("express");
const admin_route = express();
const nocache = require("nocache");
const multer = require("multer");
const session = require("express-session");
const upload = require("../config/multer.js");
const auth = require("../middleware.js/adminAuth");
const categoryController = require("../controllers/categoryController");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productcontroller");
const dotenv = require("dotenv");
dotenv.config();

admin_route.use(nocache());
admin_route.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 604800000,
    },
  })
);

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.get("/", [auth.isLogout], adminController.loadLogin);
admin_route.post("/", adminController.verifyLogin);
admin_route.get("/dashboard", [auth.isLogin], adminController.adminDashboard);
admin_route.get("/logout", [auth.isLogin], adminController.logout);

admin_route.get("/userList", [auth.isLogin], adminController.newUserLoad);
admin_route.get("/block-user", [auth.isLogin], adminController.block);
admin_route.get("/unblock-user", [auth.isLogin], adminController.unblock);

admin_route.get("/categoryList", [auth.isLogin], categoryController.categoryList);
admin_route.post("/insertCategory", [auth.isLogin], categoryController.insertCategory);
admin_route.get("/unlistcategory", [auth.isLogin], categoryController.unlistCategory);
admin_route.get("/listcategory", [auth.isLogin], categoryController.listCategory);
admin_route.get("/editCategory", [auth.isLogin], categoryController.editCategory);
admin_route.post("/editCategory", [auth.isLogin], categoryController.saveCategory);

admin_route.get("/productList", [auth.isLogin], productController.productList);
admin_route.get("/addproduct", [auth.isLogin], productController.AddProducts);
admin_route.post("/addproduct", upload.upload.array("image", 10), productController.insertProduct);
admin_route.get("/deleteProduct", [auth.isLogin], productController.deleteProduct);
admin_route.get("/editProduct", [auth.isLogin], productController.editProduct);
admin_route.post("/editProduct", [auth.isLogin], productController.updateProduct);

module.exports = admin_route;
