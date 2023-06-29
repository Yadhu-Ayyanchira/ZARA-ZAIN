const express = require("express");
const admin_route = express();
const nocache = require("nocache");
const multer = require("multer");
const session = require("express-session");
const upload = require("../config/multer.js");
const bannerUploads = require('../config/bannerMulter.js')
const auth = require("../middleware.js/adminAuth");
const categoryController = require("../controllers/categoryController");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productcontroller");
const adminOrderController = require('../controllers/adminOrderController.js')
const couponController = require('../controllers/couponController.js')
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
admin_route.get("/editProduct/:id", [auth.isLogin], productController.editProduct);
admin_route.post('/editProduct/:id', upload.upload.array("image", 10), productController.updateProduct); admin_route.get('/orderList', auth.isLogin, adminOrderController.loadOrderList)
admin_route.get('/deleteimg/:imgid/:prodid', auth.isLogin, productController.deleteimage);
admin_route.post("/editProduct/updateimage/:id", upload.upload.array('image'), productController.updateimage)

admin_route.get('/singleOrderList/:id', adminOrderController.loadSingleOrderList)
admin_route.post('/changeStatus', adminOrderController.changeStatus);
admin_route.get('/addBanner', auth.isLogin, adminController.loadAddBanner);
admin_route.post('/addBanner', bannerUploads.bannerUpload.single("image"), adminController.addBanner);
admin_route.get('/bannerList', auth.isLogin, adminController.bannerList)
admin_route.get('/deleteBanner', auth.isLogin, adminController.deleteBanner)
admin_route.get('/editBanner/:id', auth.isLogin, adminController.editBanner);
admin_route.post('/editBanner/:id', upload.upload.array("image", 1), adminController.updateBanner);

admin_route.get('/salesReportSort/:id', auth.isLogin, adminController.sortReport)
admin_route.get("/salesReport", auth.isLogin, adminController.loadSalesReport);

admin_route.get('/couponList', auth.isLogin, couponController.loadCopon);
admin_route.post('/addCoupon', couponController.addCoupon);


module.exports = admin_route;
