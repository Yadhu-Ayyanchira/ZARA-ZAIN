const Cart = require("../Models/cartModel");
const User = require("../Models/userModel");
const Product = require("../Models/productmodel");
const Order = require('../Models/orderModel')
const Category = require('../Models/categoryModel')
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
          await Cart.deleteOne({ userId: req.session.user_id });
          res.json({ codsuccess: true });
        } else {
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


  const verifyPayment = async (req,res)=>{
    try{
      const details = req.body
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.Razorpay_Key_Secret);
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
      const hmacValue = hmac.digest('hex');
    
      if(hmacValue === details.payment.razorpay_signature){
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
        await Cart.deleteOne({userId:req.session.user_id});
        res.json({success:true});
      }else{
        await Order.findByIdAndRemove({_id:details.order.receipt});
        res.json({success:false});
      }
    }catch(error){
        console.log(error.message)
   }
  }

  
  const loadOrder = async (req, res) => {
    try {
      const session = req.session.user_id;
      const user = await User.findById(session);
      const orderData = await Order.find({ userId: session }).populate("products.productId").sort({ date: -1 });
      const categoryData = await Category.find();
      const userData = await User.findById(req.session.user_id);
      
      const orderProducts = orderData.map(order => order.products); 
  
      res.render('myOrders', { session, user, orderProducts,orderData,categoryData,userData });
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadSingleOrder = async(req,res)=>{
    try {
      const id = req.params.id
      const session = req.session.user_id
      const categoryData = await Category.find();
      const userData = await User.findById(req.session.user_id);
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productId"
      );
      const orderDate = orderData.date
      console.log(orderData);
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('singleOrder', { session,orders:orderData,expectedDate,categoryData,userData});
    } catch (error) {
      console.log(error.message);
    }
  }

  const orderCancel = async (req, res) => {
    console.log('come on baby');
    try {
      const id = req.body.id;
      const userData = await Order.findById(req.session.user_id)
      const orderData = await Order.findOne({ userId: req.session.user_id, 'products._id': id})
      const product = orderData.products.find((p) => p._id.toString() === id);
      const cancelledAmount = product.totalPrice     
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: req.session.user_id,
          'product._id': id
        },
        {
          $set: {
            'product.$.status': 'cancelled'
          }
        },
        { new: true }
      );

  
      if (updatedOrder) {
        if(orderData.paymentMethod === 'online-payment'){
           await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:cancelledAmount}})
           res.json({ success: true });
        }else{
           res.json({ success: true });
        }
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

 module.exports ={
    placeOrder,
    verifyPayment,
    loadOrder,
    loadSingleOrder,
    orderCancel,

 }