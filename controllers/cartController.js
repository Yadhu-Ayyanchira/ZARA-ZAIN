const User = require("../Models/userModel");
const Product = require("../Models/productmodel");
const Category = require("../Models/categoryModel");
const Cart = require("../Models/cartModel");
const Address = require("../Models/addressModel")

const loadEmptyCart = async (req, res) => {
  try {
    const session = req.session.user_id;

    if (!session) {
      return res.render("emptyCart", { session: session });
    }

    const userData = await User.findById(req.session.user_id);
    if (userData) {
      return res.render("emptyCart", { user: userData, session });
    } else {
      const session = null;
      return res.render("emptyCart", { session });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadCart = async (req, res) => {
  try {
    let id = req.session.user_id;
    const session = req.session.user_id;
    const categoryData = await Category.find();
    const userData = await User.findById(req.session.user_id);
    let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
      "products.productId"
    );

    if (req.session.user_id) {
      let userData = await User.findOne({ _id: req.session.user_id });
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Cart.aggregate([
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
          const totalAmount = Total;
          const userId = userData._id;
          res.render("cart", {
            products: products,
            Total: Total,
            userId,
            session,
            totalAmount,
            userData,
            categoryData,
          });
        } else {
          res.render("emptyCart", {
            userData,
            session,
            message: "No Products Added to cart",
            categoryData,
          });
        }
      } else {
        res.render("emptyCart", {
          userData,
          session,
          categoryData,
          message: "No Products Added to cart",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const productId = req.body.id;
    const productData = await Product.findOne({ _id: productId });
    const cartData = await Cart.findOne({ userId: userData._id });

    if (cartData) {
      const productExists = cartData.products.some(
        (product) => product.productId == productId
      );
      if (productExists) {
        await Cart.findOneAndUpdate(
          {
            userId: userId,
            "products.productId": productId,
          },
          {
            $inc: { "products.$.count": 1 },
          }
        );
      } else {
        await Cart.findOneAndUpdate(
          { userId: userId },
          {
            $push: {
              products: {
                productId: productId,
                productPrice: productData.price,
              },
            },
          }
        );
      }
    } else {
      const newCart = new Cart({
        userId: userData._id,
        userName: userData.name,
        products: [
          {
            productId: productData._id,
            productPrice: productData.price,
          },
        ],
      });
      await newCart.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const changeProductCount = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find(
      (product) => product.productId.toString() === proId
    );
    const quantity = product.count;
    const productData = await Product.findOne({ _id: proId });

    await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );

    if (quantity < 1) {
      await Cart.updateOne(
        { userId: userData },
        {
          $pull: { products: { productId: proId } },
        }
      );
    }

    const updatedCartData = await Cart.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find(
      (product) => product.productId.toString() === proId
    );
    const updatedQuantity = updatedProduct.count;
    const price = updatedQuantity * productData.price;

    await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $set: { "products.$.totalPrice": price } }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const user = req.session.user_id;
    const id = req.query.id;
    console.log(id, user);
    await Cart.updateOne(
      { userId: user },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

// const loadCheckout = async (req,res) => {
//   try {
//     const session = req.session.user_id;
//     const userId = req.session.user_id;
//     const userData = await User.findOne({ _id: userId });
//     const categoryData = await Category.find();
//     res.render('checkout',{categoryData,userData,session})
//   } catch (error) {
//     console.log(error.message);
//   }
// }


const loadCheckout = async(req,res)=>{
  try {
    const session = req.session.user_id
    const categoryData = await Category.find();
    const userData = await User.findOne ({_id:req.session.user_id});
    const addressData = await Address.findOne({userId:req.session.user_id});
    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
        },
      },
    ]);
    if(req.session.user_id){
      if(addressData){
          if(addressData.addresses.length>0){
            const address = addressData.addresses
            const Total = total.length > 0 ? total[0].total : 0; 
            const totalAmount = Total+80;
            res.render('checkout',{session,Total,address,totalAmount,categoryData,userData})
          }
          else{
            res.render('emptyCheckout',{session,userData,categoryData,message:"Add your delivery address"});
          }
        }else{
          res.render('emptyCheckout',{session,userData,categoryData,message:"Add your delivery address"});
        }
      }else{
        res.redirect('/')
      }
  } catch (error) {
    console.log(error.message);
  }
}


const loadAddAddress = async (req,res) => {
  try {
    const session = req.session.user_id;
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const categoryData = await Category.find();
    res.render('addAddress',{categoryData,userData,session})
  } catch (error) {
    console.log(error.message);
  }
} 


module.exports = {
  loadCart,
  addToCart,
  changeProductCount,
  loadEmptyCart,
  removeProduct,
  loadCheckout,
  loadAddAddress
};
