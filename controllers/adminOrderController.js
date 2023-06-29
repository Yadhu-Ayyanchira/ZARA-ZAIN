const User = require('../Models/userModel');
const Order = require('../Models/orderModel');
const Category = require('../Models/categoryModel');


// const loadOrderList = async (req,res,next)=>{
//     try{
//         const session = req.session.Auser_id
//       const categoryData = await Category.find();
//       const adminData = await User.findById(req.session.Auser_id);  
//       const DeletePending = await Order.deleteMany({status:'pending'})
//       const orderData = await Order.find().populate("products.productId")
//       if(orderData.length > 0){
//         res.render('orderList', {session, categoryData ,admin: adminData, activePage: 'orderList',order:orderData});
//       }else{
//         res.render('orderList', {session, categoryData ,admin: adminData, activePage: 'orderList',order:[]});
//       }
      
//     }catch(err){
//       next(err);
//     }
//   }

const loadOrderList = async (req, res, next) => {
  try {
    const session = req.session.Auser_id;
    const categoryData = await Category.find();
    const adminData = await User.findById(req.session.Auser_id);
    const DeletePending = await Order.deleteMany({ status: 'pending' });
    let orderData = await Order.find().populate("products.productId");

    // Sort the orderData in ascending order based on a specific property (e.g., createdAt)
    orderData.sort((a, b) => b.date - a.date );

    if (orderData.length > 0) {
      res.render('orderList', { session, categoryData, admin: adminData, activePage: 'orderList', order: orderData });
    } else {
      res.render('orderList', { session, categoryData, admin: adminData, activePage: 'orderList', order: [] });
    }
  } catch (err) {
    next(err);
  }
};



  // const loadSingleOrderList = async (req,res,next)=>{
  //   try{
        
  //       const session = req.session.Auser_id
  //       const categoryData = await Category.find();
  //     const id = req.params.id;
  //     const adminData = await User.findById(req.session.Auser_id);  
  //     const orderData = await Order.findOne({_id:id}).populate("products.productId")
  //     res.render('orderDetails', {session,admin: adminData, activePage: 'orderList',order:orderData});
  //   }catch(err){
  //     next(err);
  //   }
  // }
const loadSingleOrderList = async (req, res, next) => {
  try {
    const { Auser_id } = req.session;
    const categoryData = await Category.find();
    const { id } = req.params;
    const adminData = await User.findById(Auser_id);
    const orderData = await Order.findOne({ _id: id }).populate("products.productId");

    res.render('orderDetails', {
      session: Auser_id,
      admin: adminData,
      activePage: 'orderList',
      order: orderData
    });
  } catch (err) {
    next(err);
  }
};


  // const changeStatus = async(req,res,next)=>{
  //   try{
  //     const id = req.body.orderId
  //     const status = req.body.status;
  //     const orderId = req.body.orderId;
  //     const userId = req.body.userId;
  //     console.log('iddd:'+id);
  //     const updateOrder = await Order.findOneAndUpdate(
  //       {
  //         userId: userId,
  //         'products._id': orderId
  //       },
  //       {
  //         $set: {
  //           'products.$.status': status
  //         }
  //       },
  //       { new: true }
  //     );
  //     if (status === "Delivered") {
  //       console.log("delivering");
  //       await Order.findOneAndUpdate(
  //         {
  //           userId: userId,
  //           'products._id': id,
  //         },
  //         {
  //           $set: {
  //             'products.$.deliveryDate': new Date(),
  //           },
  //         },
  //         { new: true }
  //       );
  //     }
  //     if(updateOrder){
  //       res.json({success:true})
  //     }

  //   }catch(err){
  //     next(err)
  //   }
  // }

const changeStatus = async (req, res, next) => {
  try {
    const { orderId, status, userId } = req.body;

    const updateQuery = {
      userId: userId,
      'products._id': orderId
    };

    const updateFields = {
      $set: {
        'products.$.status': status
      }
    };

    const updateOrder = await Order.findOneAndUpdate(updateQuery, updateFields, { new: true });

    if (status === "Delivered") {
      await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': orderId
        },
        {
          $set: {
            'products.$.deliveryDate': new Date()
          }
        },
        { new: true }
      );
    }

    if (updateOrder) {
      res.json({ success: true });
    }
  } catch (err) {
    next(err);
  }
};


  module.exports = {
    loadOrderList,
    loadSingleOrderList,
    changeStatus
  }