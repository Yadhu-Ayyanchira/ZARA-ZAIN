const User = require("../Models/userModel");
const Product = require("../Models/productmodel");
const Category = require("../Models/categoryModel");
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require("nodemailer");
const randomString = require("randomstring");
const Address = require("../Models/addressModel");
const Banner = require("../Models/bannerModel");
const dotenv = require("dotenv");
dotenv.config();
let message;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};

const sendverifyMail = async (name, email, next, otp) => {
  console.log('veri otp:'+otp);
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "yadhu2k15@gmail.com",
        pass: process.env.PASS,
      },
    });
    const mailOption = {
      from: "yadhu2k15@gmail.com",
      to: email,
      subject: "For Verification mail",
      html:
        "<p>Hi " +
        name +
        ', please click here to <a href="http://localhost:3000/otp">varify</a> and enter the for your verification' +
        email +
        " this is your otp" +
        otp +
        "</p>",
    };
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send", info.response);
        console.log("otp:"+otp);
      }
    });
    return otp;
  } catch (error) {
    next(error)
  }
};

const loadHome = async (req, res, next) => {
  try {
     var search = "";
     if (req.query.search) {
       search = req.query.search;
     }
    const banner = await Banner.find({});
    const categoryData = await Category.find();
    //const productData = await Product.find({ is_delete: false });
    const productData = await Product.find({
      is_delete: false,
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });
    if (req.session.user_id) {
      const session = req.session.user_id;
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("index", {
        userData: userData,
        session: session,
        productData: productData,
        categoryData,
        banner,
      });
    } else {
      const session = null;
      res.render("index", { session, productData, categoryData, banner });
    }
  } catch (error) {
    next(error);
  }
};

const loginLoad = async (req, res, next) => {
  try {
    const categoryData = await Category.find();
    if (req.session.user_id) {
      const session = req.session.user_id;
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("index", {
        message,
        userData,
        session,
        categoryData,
      });
      message = null;
    } else {
      const session = null;
      message = null;
      res.render("login", { session: session, message, categoryData });
    }
  } catch (error) {
    next(error);
  }
};

const loadRegister = async (req, res, next) => {
  try {
    const categoryData = await Category.find();
    if (req.session.user_id) {
      const session = req.session.user_id;
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("registration", {
        message,
        userData: userData,
        session: session,
        categoryData,
      });
      message = null;
    } else {
      const session = null;
      res.render("registration", { session, categoryData });
    }
  } catch (error) {
    next(error);
  }
};

let email;
let otp;
const insertUser = async (req, res, next) => {
  try {
    const session = null;
    const categoryData = await Category.find();
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mob,
      password: spassword,
      is_admin: 0,
    });

    email = user.email;
    const name = req.body.name;

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render("registration", {
        message: "Email already registered",
        session,
        categoryData,
      });
    }
    if (req.body.name.trim().length === 0) {
      return res.render("registration", {
        message: "Please enter a valid name",
        session,
        categoryData,
      });
    }
    if (req.body.password !== req.body.verifyPassword) {
      return res.render("registration", {
        message: "Wronggg password",
        session,
        categoryData,
      });
    } else {
      const userData = await user.save();
      if (userData) {
        randomnumber = Math.floor(Math.random() * 9000) + 1000;
        otp = randomnumber;
        sendverifyMail(name, req.body.email, randomnumber);
        console.log('otp1:'+otp);
        res.render("verifyOtp", { session, categoryData });
      } else {
        res.render("registration", {
          message: "Your registration has been failed",
          session,
          categoryData,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const banner = await Banner.find({});
    const categoryData = await Category.find();
    const session = null;
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    const productData = await Product.find({ is_delete: false });

    if (userData && userData.is_block == false) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user_id = userData._id;
        const session = req.session.user_id;
        res.render("index", {
          userData,
          session,
          productData,
          categoryData,
          banner,
        });
      } else {
        res.render("login", {
          userData: userData,
          categoryData,
          session,
          message: "Email or password is incorrect",
        });
      }
    } else {
      res.render("login", {
        userData: userData,
        categoryData,
        session,
        message: " incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
};

const userLogout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("index");
  } catch (error) {
    next(error);
  }
};

const loadShop = async (req, res, next) => {
  try {
     var search = "";
     if (req.query.search) {
       search = req.query.search;
     }

     var page = 1;
     if (req.query.page) {
       page = req.query.page;
     }
     const limit = 8;

     const productData = await Product.find({
       is_delete: false,
       $or: [
         { productName: { $regex: ".*" + search + ".*", $options: "i" } },
         { description: { $regex: ".*" + search + ".*", $options: "i" } },
       ],
     })
       .limit(limit * 1)
       .skip((page - 1) * limit)
       .exec();

       const count = await Product.find({
         is_delete: false,
         $or: [
           { product: { $regex: ".*" + search + ".*", $options: "i" } },
           { description: { $regex: ".*" + search + ".*", $options: "i" } },
         ],
       }).countDocuments();

    if (req.session.user_id) {
      const session = req.session.user_id;
      //const productData = await Product.find({ is_delete: false });
      
      const categoryData = await Category.find();
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("shop", {
        userData: userData,
        session: session,
        productData: productData,
        categoryData,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } else {
      const session = null;
      const categoryData = await Category.find();
      //const productData = await Product.find();
      res.render("shop", {
        session,
        productData: productData,
        categoryData,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }
  } catch (error) {
    next(error);
  }
};
const loadShowproduct = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const session = req.session.user_id;
      const id = req.params.id;
      const userData = await User.findById({ _id: req.session.user_id });
      const categoryData = await Category.find();
      const data = await Product.findOne({ _id: id });
      res.render("showProduct", {
        productData: data,
        session,
        categoryData,
        userData,
      });
    } else {
      const id = req.params.id;
      const session = req.session.user_id;
      const categoryData = await Category.find();
      const data = await Product.findOne({ _id: id });
      res.render("showProduct", { productData: data, session, categoryData });
    }
  } catch (error) {
    next(error);
  }
};

//  Verifying the users otp and redirecting to login page
//  =====================================================
const verifyLoad = async (req, res, next) => {
  const otp2 = req.body.otp;
  try {
    const session = req.session.user_id;
    const categoryData = await Category.find();
    if (otp2 == otp) {
      const UserData = await User.findOneAndUpdate(
        { email: email },
        { $set: { is_verified: 1 } }
      );
      if (UserData) {
        res.render("login", {
          session,
          categoryData,
          message:null
        });
      } else {
        console.log("something went wrong");
      }
    } else {
      res.render("verifyOtp", {
        message: "Please Check the OTP again!",
        session,
        categoryData,
      });
    }
  } catch (error) {
    next(error);
  }
};

const loadProfile = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const session = req.session.user_id;
      const categoryData = await Category.find();
      const userData = await User.findById({ _id: req.session.user_id })
      const addressData = await Address.findOne({
        userId: req.session.user_id,
      });
      if (addressData) {
        const address = addressData.addresses;
        res.render("userProfile", {
          userData: userData,
          session: session,
          categoryData,
          address,
        });
      } else {
        res.render("userProfile", {
          userData: userData,
          session: session,
          categoryData,
          address: 0,
        });
      }
    } else {
      const userData = await User.findById({ _id: "646dd35cb3f71f9940575fad" });
      const session = null;
      const categoryData = await Category.find();
      res.render("userProfile", { session, categoryData, userData });
    }
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const categoryData = await Category.find();
    const userData = await User.findById({ _id: req.session.user_id });
    res.render("passwordOtp", { session, categoryData, userData });
  } catch (error) {
    next(error);
  }
};

const filterCategory = async (req, res, next) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const id = req.params.id;
    const limit = 6;
    const count = await Product.find({
      is_delete: false,
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { categoryName: { $regex: ".*" + search + ".*", $options: "i" } },
        // {description:{$regex:'.*'+search+'.*',$options:'i'}},
      ],
    }).countDocuments();
    const session = req.session.user_id;
    const categoryData = await Category.find({ is_delete: false });
    const userData = await User.find({});
    const productData = await Product.find({ category: id, is_delete: false });

    if (categoryData.length > 0) {
      res.render("shop", {
        totalPages: Math.ceil(count / limit),
        productData: productData,
        session,
        categoryData: categoryData,
        userData,
      });
    } else {
      res.render("shop", {
        totalPages: Math.ceil(count / limit),
        product: [],
        session,
        category: categoryData,
        userData,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  loadShop,
  loadShowproduct,
  verifyLoad,
  sendverifyMail,
  loadProfile,
  changePassword,
  filterCategory,
};
