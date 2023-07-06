const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const usermodel = require("../Models/userModel");
const productmodel = require("../Models/productmodel")
const Order = require('../Models/orderModel')
const Banner = require('../Models/bannerModel')
const session = require("express-session");

let message;

const securePassword = async (password) => {
  try {
    const passwordMatch = await bcrypt.hash(password, 10);
    return passwordMatch;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res, next) => {
  try {
    res.render("login", { message });
    message = null;
  } catch (error) {
    next(error);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {;
        if (userData.is_admin === 0) {
          res.render("login", { message: "Email and password incorrect" });
        } else {
          req.session.Auser_id = userData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};


const adminDashboard = async (req, res, next) => {
  try {
    const [orderData, products, adminData, userData] = await Promise.all([
      Order.find({}),
      productmodel.find({}),
      usermodel.findById({ _id: req.session.Auser_id }),
      User.find({ is_block: false })
    ]);

    const result = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$products.totalPrice' } } },
      { $project: { _id: 0, total: 1 } }
    ]);

    const total = result.length > 0 ? result[0].total : 0;

    const codResult = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered', paymentMethod: 'COD' } },
      { $group: { _id: null, total: { $sum: '$products.totalPrice' } } },
      { $project: { _id: 0, total: 1 } }
    ]);

    const codTotal = codResult.length > 0 ? codResult[0].total : 0;

    const onlineResult = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered', paymentMethod: { $ne: 'COD' } } },
      { $group: { _id: null, total: { $sum: '$products.totalPrice' } } },
      { $project: { _id: 0, total: 1 } }
    ]);

    const onlineTotal = onlineResult.length > 0 ? onlineResult[0].total : 0;

     const walletResult = await Order.aggregate([
       { $unwind: "$products" },
       { $match: { "products.status": "Delivered", paymentMethod: "wallet" } },
       { $group: { _id: null, total: { $sum: "$products.totalPrice" } } },
       { $project: { _id: 0, total: 1 } },
     ]);

     const walletTotal = walletResult.length > 0 ? walletResult[0].total : 0;

    const weeklySalesCursor = Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered' } },
      { $group: { _id: { $dateToString: { format: "%d-%m-%Y", date: "$date" } }, sales: { $sum: '$products.totalPrice' } } },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    const weeklySales = await weeklySalesCursor.exec();
    const dates = weeklySales.map(item => item._id);
    const sales = weeklySales.map(item => item.sales);
    const salesSum = weeklySales.reduce((accumulator, item) => accumulator + item.sales, 0).toFixed(2);

    res.render("dashboard", { admin: adminData, products, order: orderData, onlineTotal, codTotal, walletTotal, total, sales, dates });
  } catch (error) {
    next(error);
  }
};

const newUserLoad = async (req, res, next) => {
  try {
    const userData = await usermodel.find({ is_admin: 0 });
    const adminData = await usermodel.findById({ _id: req.session.Auser_id });

    res.render("userList", { users: userData, admin: adminData });
  } catch (error) {
    next(error);
  }
};

const block = async (req, res, next) => {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id, {
      $set: { is_block: true },
    });
    req.session.users = null;
    res.redirect("/admin/userList");
  } catch (error) {
    next(error);
  }
};

const unblock = async (req, res, next) => {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id, {
      $set: { is_block: false },
    });
    req.session.users = null;
    res.redirect("/admin/userList");
  } catch (error) {
    next(error);
  }
};

const loadAddBanner = async (req, res, next) => {
  try {
    const adminData = await usermodel.findById({ _id: req.session.Auser_id });
    //const banner= await Banner.find({})

    res.render('addBanner', { admin: adminData, })
  } catch (error) {
    next(error)
  }
}

const addBanner = async (req, res, next) => {
  try {

    const adminid = req.session.Auser_id;
    const adminData = await User.findOne({ _id: adminid });
    const banner = new Banner({
      mainText: req.body.mainText,
      description: req.body.description,
      image: req.file.filename
    });

    const bannerData = await banner.save();

    if (bannerData) {
      const bannerData = await Banner.find();
      res.render("bannerList", {
        message: "Product added successfully",
        admin: adminData,
        banners: bannerData
      });
    } else {
      return res.render("bannerList", {
        message: "Enter valid details",
        admin: adminData,

      });
    }
  } catch (error) {
    next(error)
  }
};


const bannerList = async (req, res, next) => {
  try {

    const adminData = await User.findById({ _id: req.session.Auser_id });

    const bannerData = await Banner.find();
    res.render('bannerList', { banners: bannerData, admin: adminData })

  } catch (error) {
    next(error)
  }
}

//Deleting the banner
const deleteBanner = async (req, res, next) => {
  try {
    const dlt = await Banner.deleteOne({ _id: req.query.id }, { $set: { is_delete: true } })

    if (dlt) {
      res.redirect('/admin/bannerList')
    }
    else {
      res.redirect('/admin/bannerList')
    }
  } catch (error) {
    next(error)
  }
}



//Edit Banner
const editBanner = async (req, res, next) => {
  try {
    const BanData = await Banner.findById({ _id: req.params.id });
    const adminData = await User.findById({ _id: req.session.Auser_id });
    res.render('editBanner', { banner: BanData, admin: adminData })

  } catch (error) {
   next(error)
  }
}

const loadSalesReport = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const order = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered' } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);
    res.render("salesReport", { order, admin: adminData });
  } catch (error) {
    next(error)
  }
}

const updateBanner = async (req, res, next) => {
  if (req.body.description.trim() === "") {
    const id = req.params.id
    const bannerData = await Banner.findOne({ _id: id })

    const adminData = await User.findById({ _id: req.session.auser_id })
    res.render('editBanner', { admin: adminData, banners: bannerData, message: "All fields required" })
  } else {
    try {
      const arrayimg = []
      for (file of req.files) {
        arrayimg.push(file.filename)
      }
      const id = req.params.id
      let c = await Banner.updateOne({ _id: id }, {
        $set: {
          mainText: req.body.mainText,
          description: req.body.description,
        }
      })

      res.redirect('/admin/bannerList')
    } catch (error) {
      next(error)
    }
  }
}

const sortReport = async (req, res, next) => {
  try {
    const adminData = await User.findById(req.session.Auser_id);
    const id = parseInt(req.params.id);
    const from = new Date();
    const to = new Date(from.getTime() - id * 24 * 60 * 60 * 1000);

    const order = await Order.aggregate([
      {
        $unwind: "$products"
      },
      {
        $match: {
          'products.status': 'Delivered',
          'products.deliveryDate': { $gt: to, $lt: from }
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);
    res.render("salesReport", { order, admin: adminData });
  } catch (error) {
    next(error)
  }
};


module.exports = {
  loadLogin,
  verifyLogin,
  logout,
  adminDashboard,
  newUserLoad,
  block,
  unblock,
  loadAddBanner,
  addBanner,
  bannerList,
  deleteBanner,
  editBanner,
  updateBanner,
  loadSalesReport,
  sortReport,
};
