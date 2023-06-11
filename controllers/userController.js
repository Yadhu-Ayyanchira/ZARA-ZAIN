const User = require("../Models/userModel");
const productmodel = require("../Models/productmodel");
const categoryModel = require("../Models/categoryModel");
const bcrypt = require("bcrypt");
const fast2sms = require("fast-two-sms");
const session = require("express-session");
const nodemailer = require("nodemailer");
const randomString = require("randomstring");
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

const sendverifyMail = async (name, email, otp) => {
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
      form: "yadhu2k15@gmail.com",
      to: email,
      subject: "For Verification mail",
      html:
        "<p>Hi " +
        name +
        ', please click here to <a href="http://localhost:2040/otp">varify</a> and enter the for your verification' +
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
        console.log(otp);
      }
    });
    return otp;
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const categoryData = await categoryModel.find();
    const productData = await productmodel.find();
    if (req.session.user_id) {
      const session = req.session.user_id;
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("index", {
        userData: userData,
        session: session,
        productData: productData,
        categoryData,
      });
    } else {
      console.log("destroyyyyy");
      const session = null;
      res.render("index", { session, productData, categoryData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    const categoryData = await categoryModel.find();
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
  } catch (err) {
    console.log(err.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    const categoryData = await categoryModel.find();
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
  } catch (err) {
    console.log(err.message);
  }
};

let email;
const insertUser = async (req, res) => {
  try {
    const session = null;
    const categoryData = await categoryModel.find();
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
        console.log(otp);
        console.log(otp, "===", req.body.email);
        sendverifyMail(name, req.body.email, randomnumber);
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
    console.log(error);
  }
};
// verification page of user
// ==========================
// const loadVerfication = async(req,res)=>{
//   try {
//      res.render('verifyOtp')
//   } catch (error) {
//      console.log(error.message);
//   }
//   }

const verifyLogin = async (req, res) => {
  try {
    const categoryData = await categoryModel.find();
    const session = null;
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    const productData = await productmodel.find();

    if (userData && userData.is_block == false) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log(passwordMatch);
      if (passwordMatch) {
        req.session.user_id = userData._id;
        const session = req.session.user_id;
        res.render("index", { userData, session, productData, categoryData });
      } else {
        res.render("login", {
          userData: userData,
          categoryData,
          session,
          message: "Email or password is incorrect",
        });
        console.log("incorrect");
      }
    } else {
      res.render("login", {
        userData: userData,
        categoryData,
        session,
        message: "s incorrect",
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("index");
  } catch (err) {
    console.log(err.message);
  }
};

const loadShop = async (req, res) => {
  try {
    if (req.session.user_id) {
      const session = req.session.user_id;
      const productData = await productmodel.find();
      const categoryData = await categoryModel.find();
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("shop", {
        userData: userData,
        session: session,
        productData: productData,
        categoryData,
      });
    } else {
      const session = null;
      const categoryData = await categoryModel.find();
      const productData = await productmodel.find();
      res.render("shop", { session, productData: productData, categoryData });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadShowproduct = async (req, res) => {
  try {
    if (req.session.user_id) {
      const session = req.session.user_id;
      const id = req.params.id;
      const userData = await User.findById({ _id: req.session.user_id });
      const categoryData = await categoryModel.find();
      const data = await productmodel.findOne({ _id: id });
      res.render("showProduct", {
        productData: data,
        session,
        categoryData,
        userData,
      });
    } else {
      const id = req.params.id;
      const session = req.session.user_id;
      const categoryData = await categoryModel.find();
      const data = await productmodel.findOne({ _id: id });
      res.render("showProduct", { productData: data, session, categoryData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  Verifying the users otp and redirecting to login page
//  =====================================================
const verifyLoad = async (req, res) => {
  const otp2 = req.body.otp;
  try {
    const session = req.session.user_id;
    const categoryData = await categoryModel.find();
    if (otp2 == otp) {
      console.log("heyyy");
      const UserData = await User.findOneAndUpdate(
        { email: email },
        { $set: { is_verified: 1 } }
      );
      if (UserData) {
        res.redirect("/");
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
    console.log(error.message);
  }
};

const loadCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      console.log("have session");
      const session = req.session.user_id;
      const id = req.params.id;
      const userData = await User.findById({ _id: req.session.user_id });
      const categoryData = await categoryModel.find();
      const data = await productmodel.findOne({ _id: id });
      res.render("cart", {
        productData: data,
        session,
        categoryData,
        userData,
      });
    } else {
      console.log("else");
      const session = null;
      const id = req.params.id;
      const categoryData = await categoryModel.find();
      const data = await productmodel.findOne({ _id: id });
      res.render("cart", { productData: data, session, categoryData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadProfile = async (req, res) => {
  try {
    if (req.session.user_id) {
      const session = req.session.user_id;
      const categoryData = await categoryModel.find();
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("userProfile", {
        userData: userData,
        session: session,
        categoryData,
      });
    } else {
      const userData = await User.findById({ _id: "646dd35cb3f71f9940575fad" });
      const session = null;
      const categoryData = await categoryModel.find();
      res.render("userProfile", { session, categoryData, userData });
    }
  } catch (error) {
    console.log(error.message);
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
  loadCart,
  loadProfile,
};
