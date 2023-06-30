const Product = require("../Models/productmodel");
const Wishlist = require("../Models/wishlistModel");
const cart = require("../Models/cartModel");
const User = require("../Models/userModel");
const Category = require("../Models/categoryModel");

const { ObjectId } = require("mongodb");

const addToWishlist = async (req, res, next) => {
  console.log("wish in");
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const productId = req.body.id;
    const productData = await Product.findOne({ _id: productId });
    const cartData = await Wishlist.findOne({ userId: userData._id });

    if (cartData) {
      const productExists = cartData.products.some(
        (product) => product.productId == productId
      );
      if (productExists) {
        await Wishlist.findOneAndUpdate(
          {
            userId: userId,
            "products.productId": productId,
          },
          {
            $inc: { "products.$.count": 1 },
          }
        );
      } else {
        await Wishlist.findOneAndUpdate(
          { userId: userId },
          {
            $push: {
              products: {
                productId: productId,
                productPrice: productData.Price,
              },
            },
          }
        );
      }
    } else {
      const newWishlist = new Wishlist({
        userId: userData._id,
        userName: userData.name,
        products: [
          {
            productId: productData._id,
            productPrice: productData.Price,
          },
        ],
      });
      await newWishlist.save();
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const wishlistLoad = async (req, res, next) => {
  try {
    let id = req.session.user_id;
    const userData = await User.findById({ _id: req.session.user_id });
    const categoryData = await User.find({});
    const session = req.session.user_id;
    let userName = await User.findOne({ _id: req.session.user_id });
    let cartData = await Wishlist.findOne({
      userId: req.session.user_id,
    }).populate("products.productId");
    if (req.session.user_id) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Wishlist.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$products.productPrice", "$products.count"],
                  },
                },
              },
            },
          ]);
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total + 80;
          const userId = userName._id;
          const userData = await User.find({});
          res.render("wishlist", {
            products: products,
            Total: Total,
            userId,
            session,
            totalAmount,
            user: userName,
            userData,
            categoryData,
          });
        } else {
          res.render("emptyWishlist", {
            user: userName,
            session,
            userData,
            categoryData,
            message: "No Products Added to wishlist",
          });
        }
      } else {
        res.render("emptyWishlist", {
          user: userName,
          session,
          userData,
          categoryData,
          message: "No Products Added to wishlist",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  wishlistLoad,
};
