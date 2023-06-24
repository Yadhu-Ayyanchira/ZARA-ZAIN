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

const adminDashboard = async (req, res, next) => {
  try {
    const orderData = await Order.find({});
    const products = await productmodel.find({});
    const adminData = await usermodel.findById({ _id: req.session.Auser_id });
    res.render("dashboard", { admin: adminData, products, order: orderData });
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
      mainText:req.body.mainText,
      description:req.body.description,
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

module.exports = {
  loadLogin,
  verifyLogin,
  logout,
  adminDashboard,
  newUserLoad,
  block,
  unblock,
  loadAddBanner,
  addBanner
  // editUserLoad,
  // updateUsers,
  // deleteUser,
  // addUser,
  // addUser,
};
