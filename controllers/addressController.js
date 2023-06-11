const User = require("../Models/userModel");
const Address = require("../Models/addressModel");
const Category = require("../Models/categoryModel");

//-------- Address loding section  -----------//
const loadAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressData = await Address.findOne({ userId: req.session.user_id });
    if (session) {
      if (addressData) {
        const address = addressData.addresses;
        res.render("userAddress", {
          user: userData,
          session,
          address: address,
        });
      } else {
        res.render("emptyUserAddress", { user: userData, session });
      }
    } else {
      res.redirect("/home", { user: userData, session });
    }
  } catch (error) {
    log(error.message);
  }
};

//-------- load  Address inserting section  -----------//
const loadInsertAddress = async (req, res) => {
  try {
    const session = req.session.user_id;

    if (!session) {
      return res.render("insertAddress", { session: session });
    }
    const userData = await User.findById({ _id: req.session.user_id });
    if (userData) {
      return res.render("insertAddress", { user: userData, session });
    } else {
      const session = null;
      return res.render("insertAddress", { session });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------- Adrees inserting section  -----------//
const insertAddresss = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userId = req.session.user_id;
    console.log(userId);
    const userData = await User.findOne({ _id: userId });
    const categoryData = await Category.find();
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    console.log(addressDetails);
    if (addressDetails) {
      const updateOne = await Address.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: {
              userName: req.body.userName,
              mobile: req.body.mobile,
              altrenativeMob: req.body.mobile2,
              houseName: req.body.house,
              landmark: req.body.landmark,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            },
          },
        }
      );
      if (updateOne) {
        console.log("here");
        const address = await Address.find();
        res.render("checkout", { address, categoryData, session, userData });
      } else {
        res.render("checkout", { address, categoryData, session, userData });
      }
    } else {
      const address = new Address({
        userId: req.session.user_id,
        addresses: [
          {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.mobile2,
            houseName: req.body.house,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
      console.log(address);
      const addressData = await address.save();
      const addresses = await Address.find();
      if (addressData) {
        console.log("here111");
        res.render("checkout", { address, categoryData, session, userData });
      } else {
        console.log("here222");

        res.render("checkout", {
          address: addresses,
          categoryData,
          session,
          userData,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadAddress,
  loadInsertAddress,
  insertAddresss,
};
