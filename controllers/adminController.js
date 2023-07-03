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
    console.log("nice");
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
      console.log(passwordMatch);
      if (passwordMatch) {
        console.log("correct");
        console.log(userData.is_admin);
        if (userData.is_admin === 0) {
          res.render("login", { message: "Email and password incorrect" });
        } else {
          req.session.Auser_id = userData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
        console.log("incorrect");
      }
    } else {
      res.render("login", { message: "Email and password incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

// const loadDashboard = async (req, res, next) => {
//   try {
//     const adminData = await User.findById({ _id: req.session.user_id });
//     res.render("dashboard", { admin: adminData });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

// const adminDashboard = async (req, res, next) => {
//   try {
//     const orderData = await Order.find({});
//     const products = await productmodel.find({});
//     const adminData = await usermodel.findById({ _id: req.session.Auser_id });
//     const userData = await User.find({ is_block: false })


//     //find total delivered sale

//     const result = await Order.aggregate([
//       { $unwind: "$products" },
//       { $match: { 'products.status': 'Delivered' } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$products.totalPrice' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           total: 1
//         }
//       }
//     ]);


//     let total = 0
//     if (result.length > 0) {
//        total = result[0].total;
//     }




//     //total cod sale

//     const codResult = await Order.aggregate([
//       { $unwind: "$products" },
//       { $match: { 'products.status': 'Delivered', paymentMethod: 'COD' } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$products.totalPrice' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           total: 1
//         }
//       }
//     ]);

//     let codTotal = 0
//     if (codResult.length > 0) {
//       codTotal = codResult[0].total;
//     }


//     //total online payment and wallet
//     const onlineResult = await Order.aggregate([
//       { $unwind: "$products" },
//       { $match: { 'products.status': 'Delivered', 'paymentMethod': { $ne: 'COD' } } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$products.totalPrice' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           total: 1
//         }
//       }
//     ]);

//     let onlineTotal = 0;
//     if (onlineResult.length > 0) {
//       onlineTotal = onlineResult[0].total;
//     }



//     const weeklySalesCursor = Order.aggregate([
//       {
//         $unwind: "$products"
//       },
//       {
//         $match: {
//           'products.status': 'Delivered'
//         }
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
//           sales: { $sum: '$products.totalPrice' }
//         }
//       },
//       {
//         $sort: { _id: 1 }
//       },
//       {
//         $limit: 7
//       }
//     ]);

//     const weeklySales = await weeklySalesCursor.exec();
//     const dates = weeklySales.map(item => item._id);
//     const sales = weeklySales.map(item => item.sales);
//     const salesSum = (weeklySales.reduce((accumulator, item) => accumulator + item.sales, 0)).toFixed(2);
//     console.log(sales, dates);
//     res.render("dashboard", { admin: adminData, products, order: orderData, onlineTotal, codTotal, total, sales, dates });
//   } catch (error) {
//     next(error);
//   }
// };
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


// const editUserLoad = async (req, res, next) => {
//   try {
//     const id = req.query.id;
//     const userData = await User.findById({ _id: id });
//     if (userData) {
//       res.render("edit-user", { user: userData });
//     } else {
//       res.redirect("/admin/dashboard");
//     }
//   } catch (error) {
//     next(error); 
//    }
// };
// const updateUsers = async (req, res, next) => {
//   try {
//     console.log(req.body.name);
//     const userData = await User.findByIdAndUpdate(
//       { _id: req.body.id },
//       {
//         $set: {
//           name: req.body.name,
//           email: req.body.email,
//           mobile: req.body.mob,
//         },
//       }
//     );
//     res.redirect("/admin/dashboard");
//   } catch (error) {
//     next(error);  
//     }
// };

// const deleteUser = async (req, res, next) => {
//   try {
//     const id = req.query.id;
//     await User.deleteOne({ _id: id });
//     res.redirect("/admin/dashboard");
//   } catch (error) {
//     next(error);
//   }
// };

const newUserLoad = async (req, res, next) => {
  try {
    const userData = await usermodel.find({ is_admin: 0 });
    const adminData = await usermodel.findById({ _id: req.session.Auser_id });

    res.render("userList", { users: userData, admin: adminData });
  } catch (error) {
    next(error);
  }
};

// const addUser = async (req, res, next) => {
//   try {
//     const spassword = await securePassword(req.body.password);
//     console.log(req.body);
//     const user = new User({
//       name: req.body.name,
//       email: req.body.email,
//       mobile: req.body.mob,
//       password: spassword,
//       is_admin: 0,
//     });

//     const userData = await user.save();

//     if (userData) {
//       const userData = await User.findById({ _id: req.session.Auser_id });
//       res.redirect("/admin/dashboard");
//     } else {
//       res.render("add", { message: "Your registration has been failed" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

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

const loadAddBanner = async (req, res) => {
  try {
    const adminData = await usermodel.findById({ _id: req.session.Auser_id });
    //const banner= await Banner.find({})

    res.render('addBanner', { admin: adminData, })
  } catch (err) {
    console.log(err.message);
  }
}

const addBanner = async (req, res) => {
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
      res.render("bannerlist", {
        message: "Product added successfully",
        admin: adminData,
        banner: bannerData
      });
    } else {
      return res.render("bannerlist", {
        message: "Enter valid details",
        admin: adminData,

      });
    }
  } catch (err) {
    console.log(err.message);
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
const deleteBanner = async (req, res) => {
  try {
    const dlt = await Banner.deleteOne({ _id: req.query.id }, { $set: { is_delete: true } })

    if (dlt) {
      res.redirect('/admin/bannerList')
    }
    else {
      res.redirect('/admin/bannerList')
    }
  } catch (error) {
    console.log(error.message);
  }
}



//Edit Banner
const editBanner = async (req, res) => {
  try {
    const BanData = await Banner.findById({ _id: req.params.id });
    const adminData = await User.findById({ _id: req.session.Auser_id });
    res.render('editBanner', { banner: BanData, admin: adminData })

  } catch (error) {
    console.log(error.message);
  }
}

const loadSalesReport = async (req, res) => {
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
    console.log(error.message);
  }
}
// const loadSalesReport = async (req, res) => {
//   try {
//     const adminData = await User.findById(req.session.Auser_id);
//     const order = await Order.aggregate([
//       { $unwind: "$products" },
//       { $match: { 'products.status': 'Delivered' } },
//       { $sort: { date: -1 } },
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'products.productId',
//           foreignField: '_id',
//           as: 'products.productDetails'
//         }
//       },
//       { $addFields: { 'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] } } }
//     ]);
//     res.render("salesReport", { order, admin: adminData });
//   } catch (error) {
//     console.log(error.message);
//   }
// };


const updateBanner = async (req, res) => {
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
      console.log(error.message);
    }
  }
}

// const sortReport = async (req, res) => {
//   try {
//     const adminData = await User.findById({ _id: req.session.Auser_id });
//     const id = parseInt(req.params.id);
//     const from = new Date();
//     const to = new Date(from.getTime() - id * 24 * 60 * 60 * 1000);

//     const order = await Order.aggregate([
//       { $unwind: "$products" },
//       {
//         $match: {
//           'products.status': 'Delivered',
//           $and: [
//             { 'products.deliveryDate': { $gt: to } },
//             { 'products.deliveryDate': { $lt: from } }
//           ]
//         }
//       },
//       { $sort: { date: -1 } },
//       {
//         $lookup: {
//           from: 'products',
//           let: { productId: { $toObjectId: '$products.productId' } },
//           pipeline: [
//             { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
//           ],
//           as: 'products.productDetails'
//         }
//       },
//       {
//         $addFields: {
//           'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
//         }
//       }
//     ]);
//     console.log(order)

//     res.render("salesReport", { order, admin: adminData });

//   } catch (error) {
//     console.log(error.message);
//   }
// }

const sortReport = async (req, res) => {
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

    console.log(order);
    res.render("salesReport", { order, admin: adminData });
  } catch (error) {
    console.log(error.message);
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
  // editUserLoad,
  // updateUsers,
  // deleteUser,
  // addUser,
  // addUser,
};
