const User = require("../Models/userModel");
const Product = require("../Models/productmodel");
const Category = require("../Models/categoryModel");
const Cart = require("../Models/cartModel");

// ---------- Emptycart loading section start
const loadEmptyCart = async (req, res) => {
  try {
    const session = req.session.user_id;

    if (!session) {
      return res.render("emptyCart", { session: session });
    }

    const userData = await User.findById({ _id: req.session.user_id });
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

// ---------- Cart loading section start
// const loadCart = async (req, res) => {
//   try {
//     let id = req.session.user_id;
//     const session = req.session.user_id;
//     const categoryData = await Category.find();
//     let userData = await User.findOne({ _id: req.session.user_id });
//     let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
//       "products.productId"
//     );
//     if (req.session.user_id) {
//       if (cartData) {
//         if (cartData.products.length > 0) {
//           const products = cartData.products;
//           const total = await Cart.aggregate([
//             { $match: { userId: req.session.user_id } },
//             { $unwind: "$products" },
//             {
//               $group: {
//                 _id: null,
//                 total: {
//                   $sum: {
//                     $multiply: ["$products.productPrice", "$products.count"],
//                   },
//                 },
//               },
//             },
//           ]);
//           const Total = total.length > 0 ? total[0].total : 0;
//           const totalAmount = Total + 80;
//           // const userId = userName._id;
//           const userData = await User.findById({ _id: req.session.user_id });
//           res.render("cart", {
//             products: products,
//             Total: Total,
//             // userId,
//             session,
//             userData,
//             totalAmount,
//             userData: userData,
//             categoryData,
//           });
//         } else {
//           console.log("no prdtsssss");
//           res.render("cart", {
//             user: userData,
//             session,
//             message: "No Products Added to cart",
//             categoryData,
//             products,
//           });
//         }
//       } else {
//         console.log("no prdts");
//         const products = 0;
//         res.render("cart", {
//           userData: userData,
//           session,
//           message: "No Products Added to cart",
//           categoryData,
//           products,
//         });
//       }
//     } else {
//       res.redirect("/login");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// ---------- Cart loading section start
const loadCart = async(req,res)=>{
  try {
    let id = req.session.user_id;
    const session = req.session.user_id
    const categoryData = await Category.find();
    const userData = await User.findById({ _id: req.session.user_id });
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
                total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
              },
            },
          ]);
          const Total = total.length > 0 ? total[0].total : 0; 
           const totalAmount = Total+80;   
          const userId = userData._id;
          res.render("cart", { products:products,Total:Total,userId,session,totalAmount,userData,categoryData});
        }else {
          res.render("emptyCart", {
            userData,
            session,
            message: "No Products Added to cart",
            categoryData,
          });}
      }else {
        res.render("emptyCart", {
          userData,
          session,
          categoryData,message: "No Products Added to cart",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
}
       

// ---------- Add to cart section start
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

// ---------- Change product quantity in cart section
const changeProductCount = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find(
      (product) => product.productId === proId
    );
    const quantity = product.count;
    const productData = await Product.findOne({ _id: proId });

    const cartdata = await Cart.updateOne(
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
      (product) => product.productId === proId
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
    console.log(id,user);
    await Cart.updateOne(
      { userId: user },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  addToCart,
  changeProductCount,
  loadEmptyCart,
  removeProduct
};
