const Cart = require("../Models/cartModel");
const User = require("../Models/userModel");
const Product = require("../Models/productmodel");
const Order = require('../Models/orderModel')
const razorpay = require('razorpay');
const env = require('dotenv')
env.config();

var instance = new razorpay({
  key_id: process.env.Razorpay_Key_Id,
  key_secret: process.env.Razorpay_Key_Secret,
});

const placeOrder = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      const address = req.body.address;
      const cartData = await Cart.findOne({ userId: req.session.user_id });
      const products = cartData.products;
      const total = parseInt(req.body.Total);
      const paymentMethod = req.body.payment;
      const status = paymentMethod === 'COD' ? "placed" : "pending";
     
      const order = new Order({
        deliveryAddress: address,
        userId: req.session.user_id,
        userName: userData.name,
        paymentMethod: paymentMethod,
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(), 
      });
      
  
      const orderData = await order.save();
      console.log(orderData);
      if (orderData) {
        console.log('yessss');
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productId;
          const count = products[i].count;
          await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
        }
  
        if (order.status === 'placed') {
            console.log('yessssqqq');
          await Cart.deleteOne({ userId: req.session.user_id });
          res.json({ codsuccess: true });
        } else {
            console.log('yesssszzzz');
          const orderId = orderData._id;
          const totalAmount = orderData.totalAmount;
          var options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: '' + orderId,
          };
  
          instance.orders.create(options, function (err, order) {
              res.json({ order });
            
          });
        }
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


 module.exports ={
    placeOrder
 }